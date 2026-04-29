#!/usr/bin/env python3
"""
UI Generator - Convert vague ideas into polished HTML interfaces using Ollama
All fixes applied:
  1. num_predict = -1 (unlimited tokens for local models only)
     Cloud models (name ends with '-cloud') omit num_predict to avoid a 400 error
     from their OpenAI-compatible endpoint which rejects negative values.
  2. num_ctx = 16384 (large context window)
  3. Completeness check after extraction
  4. Two-pass generation (structure+CSS first, then JS)
"""

import os
import sys
import json
import ollama
import re
import requests
from datetime import datetime
from pathlib import Path
import argparse
import webbrowser

# Add transformer_core directory to path to import config
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Try importing config; fall back to safe defaults if not found
try:
    from config import OLLAMA_MODEL, OLLAMA_HOST
except ImportError:
    OLLAMA_MODEL = "llama3.2"
    OLLAMA_HOST  = "http://localhost:11434"

# Runtime config (can be overridden by CLI args or env vars)
OLLAMA_BASE = os.environ.get("OLLAMA_BASE", OLLAMA_HOST)
MODEL       = os.environ.get("OLLAMA_MODEL", OLLAMA_MODEL)

# ─────────────────────────────────────────────────────────────────────────────
# System prompts
# ─────────────────────────────────────────────────────────────────────────────

REFINE_SYSTEM = """You are a UI/UX prompt engineer. Take a vague user idea and rewrite it into a detailed, specific frontend prompt.

Your refined prompt must include:
- Layout structure (header, main, sidebar, grid, etc.)
- Color scheme (specific colors or palette mood)
- Typography style (font choices, sizes, weights)
- Key components (buttons, cards, forms, etc.)
- Animations and transitions (hover effects, page transitions, micro-interactions)
- Overall mood and tone (professional, playful, minimal, etc.)
- Responsive behavior (mobile, tablet, desktop adaptations)
- Accessibility considerations (contrast, focus states, semantic HTML)

Format the output as a clear, structured paragraph. Be specific but concise.
Return ONLY the refined prompt. No explanation, no preamble."""

STRUCTURE_SYSTEM = """You are an elite frontend developer. Given a detailed UI description, generate ONLY the HTML structure and complete <style> block.

Requirements:
- Return ONLY raw HTML. No markdown, no code fences, no explanation.
- Include <!DOCTYPE html>, <html>, <head>, and <body> tags.
- All CSS must be inside <style> in <head>. Use Google Fonts via @import.
- Do NOT include any <script> tags yet — JavaScript will be added separately.
- Use responsive design with media queries, flexbox/grid, custom CSS properties.
- Add smooth transitions, hover effects, shadows, and modern polish.
- Ensure proper contrast and focus states for accessibility.
- Include a favicon using a simple emoji data URI.
- Close ALL tags properly and end with </html>.
- The <body> should have placeholder elements (empty containers, dummy text) where JS will inject dynamic content."""

JS_SYSTEM = """You are an elite frontend JavaScript developer. Given an existing HTML file, add a complete <script> block before </body>.

Requirements:
- Return the COMPLETE updated HTML file — do not omit or truncate any existing code.
- Add ALL interactivity, dynamic behavior, animations, and logic inside one <script> block placed just before </body>.
- Do NOT use external JS libraries unless they are loaded via a CDN <script src="..."> tag you add to <head>.
- Keep all existing HTML and CSS exactly as-is.
- Make sure the script runs after the DOM is loaded (use DOMContentLoaded or place script at end of body).
- Close ALL tags properly and end with </html>."""

# Alias for compatibility with router_build.py
GENERATE_SYSTEM = STRUCTURE_SYSTEM

# ─────────────────────────────────────────────────────────────────────────────
# Progress indicator
# ─────────────────────────────────────────────────────────────────────────────

class ProgressIndicator:
    """Handles progress display for streaming responses"""

    def __init__(self, total_steps=3):
        self.total_steps = total_steps
        self.current_step = 0

    def start_step(self, name):
        self.current_step += 1
        print(f"\n[{self.current_step}/{self.total_steps}] {name}...", flush=True)

    def update(self, chunk):
        # Print a dot for every ~50 chars to show activity without flooding
        if hasattr(self, '_char_count'):
            self._char_count += len(chunk)
        else:
            self._char_count = len(chunk)

        dots = self._char_count // 50
        if dots > getattr(self, '_dots_printed', 0):
            print(".", end="", flush=True)
            self._dots_printed = dots

    def complete(self, token_count=None):
        info = f" ({token_count} tokens)" if token_count else ""
        print(f" ✅{info}", flush=True)
        self._char_count = 0
        self._dots_printed = 0

    def error(self, message):
        print(f" ❌\n  Error: {message}\n", flush=True)


# ─────────────────────────────────────────────────────────────────────────────
# Ollama / OpenRouter API calls
# ─────────────────────────────────────────────────────────────────────────────

def _ollama_stream_with_watchdog(model_to_use, messages, options, timeout_secs=120):
    """
    Run ollama.chat(stream=True) in a daemon thread with a per-chunk watchdog.
    If no new chunk arrives within `timeout_secs`, raises RuntimeError.
    Returns the full concatenated response string.
    """
    import threading

    result_holder = {"output": None, "error": None}
    chunk_event   = threading.Event()
    output_parts  = []

    def _stream_worker():
        try:
            response = ollama.chat(
                model=model_to_use,
                messages=messages,
                options=options,
                stream=True,
            )
            for chunk in response:
                content = chunk.get("message", {}).get("content", "")
                if content:
                    output_parts.append(content)
                chunk_event.set()   # signal watchdog: still alive
                chunk_event.clear()
            result_holder["output"] = "".join(output_parts).strip()
        except Exception as exc:
            result_holder["error"] = exc
            chunk_event.set()

    thread = threading.Thread(target=_stream_worker, daemon=True)
    thread.start()

    # Watchdog loop: wait for each chunk; if none arrives within timeout, abort
    while thread.is_alive():
        got_chunk = chunk_event.wait(timeout=timeout_secs)
        if not got_chunk and thread.is_alive():
            raise RuntimeError(
                f"Ollama stream timed out after {timeout_secs}s with no response "
                f"from model '{model_to_use}'. The model may be overloaded or unreachable."
            )

    if result_holder["error"]:
        raise result_holder["error"]
    return result_holder["output"] or ""


def _ollama_cloud_post(model_to_use, messages, timeout_secs=120):
    """
    For cloud-hosted models: bypass the ollama Python streaming client entirely
    and call the Ollama REST endpoint directly (non-streaming, hard timeout).
    This avoids the indefinite hang that occurs when the cloud proxy stalls.
    """
    url = f"{OLLAMA_BASE.rstrip('/')}/api/chat"
    payload = {
        "model":    model_to_use,
        "messages": messages,
        "stream":   False,
        "options":  {"temperature": 0.7},
    }
    try:
        resp = requests.post(url, json=payload, timeout=timeout_secs)
        resp.raise_for_status()
        data = resp.json()
        # Ollama non-stream response: {"message": {"role": "assistant", "content": "..."}}
        return data.get("message", {}).get("content", "").strip()
    except requests.Timeout:
        raise RuntimeError(
            f"Cloud model '{model_to_use}' did not respond within {timeout_secs}s. "
            "Try a faster model or check your Ollama cloud connection."
        )
    except requests.RequestException as exc:
        raise RuntimeError(f"Ollama REST request failed for model '{model_to_use}': {exc}") from exc


def ollama_chat(system, prompt, progress=None, model=None):
    """
    Call Ollama with timeout protection.

    - Cloud models (name ends with '-cloud'): non-streaming HTTP POST, 120 s hard timeout.
    - Local models: streaming with a 120 s per-chunk watchdog so a stalled model
      doesn't block the build thread forever.

    Args:
        system   : System prompt string
        prompt   : User prompt string
        progress : Optional ProgressIndicator
        model    : Model name; falls back to global MODEL

    Returns:
        str: Complete response text
    """
    model_to_use = (model or MODEL or "").strip()
    if not model_to_use:
        raise ValueError(f"No valid model specified. Got model={repr(model)}, global MODEL={repr(MODEL)}")

    messages = [
        {"role": "system", "content": system},
        {"role": "user",   "content": prompt},
    ]

    is_cloud_model = model_to_use.endswith("-cloud")

    try:
        if is_cloud_model:
            # Cloud models: skip all Ollama-specific options (num_ctx, num_predict),
            # use a direct non-streaming POST with a hard 120-second timeout.
            full_output = _ollama_cloud_post(model_to_use, messages, timeout_secs=120)
        else:
            # Local models: stream with per-chunk watchdog (120 s between chunks).
            options = {
                "temperature": 0.7,
                "num_predict": -1,      # unlimited for local models
                "num_ctx":     16384,
            }
            full_output = _ollama_stream_with_watchdog(model_to_use, messages, options, timeout_secs=120)

        if progress and full_output:
            progress.update(full_output)

        return full_output

    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Ollama request failed for model '{model_to_use}': {e}") from e



def openrouter_chat(system, prompt, api_key, model="openai/gpt-4o", progress=None):
    """
    Call OpenRouter API (non-streaming).

    Args:
        system   : System prompt
        prompt   : User prompt
        api_key  : OpenRouter API key
        model    : Model identifier
        progress : Optional ProgressIndicator

    Returns:
        str: Response text
    """
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        "max_tokens": 16000,
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=180)
        resp.raise_for_status()
        output = resp.json()["choices"][0]["message"]["content"].strip()
        if progress:
            progress.update(output)
        return output
    except requests.RequestException as e:
        raise RuntimeError(f"OpenRouter request failed: {e}") from e


# ─────────────────────────────────────────────────────────────────────────────
# HTML extraction & validation
# ─────────────────────────────────────────────────────────────────────────────

def extract_html(text):
    """
    Extract a complete HTML document from model output.
    Tries multiple patterns and falls back gracefully.

    Args:
        text: Raw model output

    Returns:
        str: Extracted HTML string

    Raises:
        ValueError: If no valid HTML can be extracted
    """
    if not text or not text.strip():
        raise ValueError("Model returned an empty response.")

    # Strip <think>...</think> reasoning blocks (some models include these)
    text = re.sub(r'<think>[\s\S]*?</think>', '', text).strip()
    if not text:
        raise ValueError("Response was empty after stripping <think> blocks.")

    # Pattern list: (regex, needs_wrapping)
    patterns = [
        (r'```(?:html|html5)?\s*([\s\S]*?)```', False),   # Markdown fenced block
        (r'(<!DOCTYPE\s+html[\s\S]*)',           False),   # Starts with DOCTYPE
        (r'(<html[\s\S]*</html>)',               False),   # <html>...</html>
        (r'(<body[\s\S]*</body>)',               True),    # Body only — wrap it
    ]

    for pattern, needs_wrap in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            html = match.group(1).strip()
            if not html:
                continue

            if needs_wrap:
                style_match = re.search(r'<style[^>]*>([\s\S]*?)</style>', html, re.IGNORECASE)
                inner_style = style_match.group(1) if style_match else ""
                html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated UI</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: system-ui, sans-serif; line-height: 1.6; background: #fff; }}
        {inner_style}
    </style>
</head>
{html}
</html>"""
            return html

    # Last resort: treat entire response as HTML if it contains tags
    if '<' in text and '>' in text:
        html = text.strip()
        if not html.lower().startswith('<!doctype'):
            html = (
                "<!DOCTYPE html>\n<html lang=\"en\">\n"
                "<head><meta charset='UTF-8'>"
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                "</head>\n<body>\n" + html + "\n</body>\n</html>"
            )
        return html

    raise ValueError("Could not extract any valid HTML from the model response.")


def check_completeness(html):
    """
    FIX 3: Verify the HTML document is structurally complete.

    Returns:
        list[str]: List of completeness issues found (empty = OK)
    """
    issues = []

    if not re.search(r'</html>', html, re.IGNORECASE):
        issues.append("Missing </html> closing tag — output was likely truncated.")
    if not re.search(r'</body>', html, re.IGNORECASE):
        issues.append("Missing </body> closing tag.")
    if not re.search(r'</head>', html, re.IGNORECASE):
        issues.append("Missing </head> closing tag.")
    if not re.search(r'<style[\s\S]*?</style>', html, re.IGNORECASE):
        issues.append("No <style> block found — CSS may be missing.")

    return issues


def validate_html(html):
    """Check HTML for best-practice warnings (non-fatal)."""
    warnings = []

    if not re.search(r'<!doctype\s+html>', html, re.IGNORECASE):
        warnings.append("Missing DOCTYPE declaration.")
    if not re.search(r'<meta\s+charset=', html, re.IGNORECASE):
        warnings.append("Missing charset meta tag.")
    if not re.search(r'viewport', html, re.IGNORECASE):
        warnings.append("Missing viewport meta tag (responsive design may break).")
    if not re.search(r'@media', html, re.IGNORECASE):
        warnings.append("No media queries found — may not be fully responsive.")

    return warnings


# ─────────────────────────────────────────────────────────────────────────────
# File utilities
# ─────────────────────────────────────────────────────────────────────────────

def save_with_timestamp(base_path, content):
    """Save content to a timestamped file and return the actual filename."""
    timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
    path = Path(base_path)
    stamped = path.parent / f"{path.stem}-{timestamp}{path.suffix}"
    stamped.write_text(content, encoding="utf-8")
    return str(stamped)


def open_in_browser(filepath):
    """Open an HTML file in the system default browser."""
    try:
        abs_path = os.path.abspath(filepath)
        webbrowser.open(f"file://{abs_path}")
        return True
    except Exception as e:
        print(f"  ⚠️  Could not open browser: {e}")
        return False


# ─────────────────────────────────────────────────────────────────────────────
# Core generation pipeline
# ─────────────────────────────────────────────────────────────────────────────

def generate_structure(refined_prompt, progress):
    """
    Pass A — Generate HTML skeleton + full CSS (no JS yet).
    Returns raw HTML string.
    """
    structure_prompt = (
        f"{refined_prompt}\n\n"
        "Generate the complete HTML structure and <style> block. "
        "Do NOT include any <script> tags. "
        "End the file with </html>."
    )
    return ollama_chat(STRUCTURE_SYSTEM, structure_prompt, progress)


def inject_javascript(structure_html, refined_prompt, progress):
    """
    Pass B — Add JavaScript to the existing structure HTML.
    FIX 4: Two-pass approach keeps each generation focused and smaller.
    Returns complete final HTML string.
    """
    js_prompt = (
        f"Original UI specification:\n{refined_prompt}\n\n"
        f"Existing HTML file:\n{structure_html}\n\n"
        "Now add a complete <script> block just before </body> with ALL required "
        "JavaScript for interactivity, animations, and dynamic behaviour. "
        "Return the COMPLETE updated HTML file ending with </html>."
    )
    return ollama_chat(JS_SYSTEM, js_prompt, progress)


def run(user_prompt, open_browser=False):
    """
    Full generation pipeline:
      1. Refine user prompt
      2. Generate HTML structure + CSS
      3. Inject JavaScript
      4. Save and (optionally) open in browser
    """
    total_steps = 3
    progress = ProgressIndicator(total_steps=total_steps)

    print(f"\n🎨 UI Generator v2.0 (Python — all fixes applied)")
    print(f"📝 Input : \"{user_prompt}\"")
    print(f"🤖 Model : {MODEL}\n")

    # ── Step 1: Refine prompt ────────────────────────────────────────────────
    progress.start_step("Refining prompt")
    try:
        refined_prompt = ollama_chat(REFINE_SYSTEM, user_prompt, progress)
        progress.complete(len(refined_prompt.split()))
    except Exception as e:
        progress.error(str(e))
        sys.exit(1)

    print(f"\n📋 Refined specification:\n{'─' * 60}")
    print(refined_prompt)
    print('─' * 60)

    # ── Step 2: Generate HTML structure + CSS ───────────────────────────────
    progress.start_step("Generating HTML structure + CSS  [Pass 1/2]")
    try:
        raw_structure = generate_structure(refined_prompt, progress)
        structure_html = extract_html(raw_structure)
        progress.complete(len(structure_html))
    except Exception as e:
        progress.error(str(e))
        sys.exit(1)

    # Check pass-1 completeness
    issues = check_completeness(structure_html)
    if issues:
        print(f"\n⚠️  Pass 1 completeness issues detected:")
        for issue in issues:
            print(f"   • {issue}")
        print("   Proceeding with pass 2 — JS injection may partially repair structure.")

    # ── Step 3: Inject JavaScript ────────────────────────────────────────────
    progress.start_step("Injecting JavaScript  [Pass 2/2]")
    try:
        raw_final = inject_javascript(structure_html, refined_prompt, progress)
        final_html = extract_html(raw_final)
        progress.complete(len(final_html))
    except Exception as e:
        progress.error(str(e))
        print("⚠️  JS injection failed. Saving structure-only version instead.")
        final_html = structure_html

    # ── Final completeness + validation checks ───────────────────────────────
    issues   = check_completeness(final_html)
    warnings = validate_html(final_html)

    if issues:
        print(f"\n❌ Completeness issues in final output:")
        for issue in issues:
            print(f"   • {issue}")
        print("   The saved file may render partially. Consider re-running.")
    else:
        print(f"\n✅ HTML completeness check passed.")

    # ── Save files ───────────────────────────────────────────────────────────
    html_file     = save_with_timestamp("output.html",        final_html)
    prompt_file   = save_with_timestamp("refined-prompt.txt", refined_prompt)
    structure_file= save_with_timestamp("structure.html",     structure_html)

    # Always keep a "latest" copy for quick access
    Path("output.html").write_text(final_html,       encoding="utf-8")
    Path("refined-prompt.txt").write_text(refined_prompt,  encoding="utf-8")
    Path("structure.html").write_text(structure_html, encoding="utf-8")

    print(f"\n📁 Files saved:")
    print(f"   • {html_file}        ({len(final_html):,} bytes)  ← final")
    print(f"   • {structure_file}   ({len(structure_html):,} bytes)  ← structure only")
    print(f"   • {prompt_file}")
    print(f"   • output.html        (latest final version)")
    print(f"   • structure.html     (latest structure version)")

    if warnings:
        print(f"\n⚠️  Best-practice warnings:")
        for w in warnings:
            print(f"   • {w}")

    if open_browser:
        print(f"\n🌐 Opening in browser...")
        open_in_browser("output.html")

    print(f"\n🎉 Done!\n")


# ─────────────────────────────────────────────────────────────────────────────
# CLI entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    global MODEL, OLLAMA_BASE

    parser = argparse.ArgumentParser(
        description="Convert vague ideas into polished HTML interfaces using Ollama",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s "a todo app"
  %(prog)s "a landing page for a coffee shop" --open
  %(prog)s "a dashboard with charts" --model llama3.2
  %(prog)s "a portfolio page" --model mistral --open
        """,
    )

    parser.add_argument(
        "prompt",
        nargs="?",
        default="a modern dashboard with cards and charts",
        help="Your UI idea (default: 'a modern dashboard with cards and charts')",
    )
    parser.add_argument(
        "--open", "-o",
        action="store_true",
        help="Open the generated UI in your default browser after generation",
    )
    parser.add_argument(
        "--model", "-m",
        default=MODEL,
        help=f"Ollama model to use (default: {MODEL})",
    )
    parser.add_argument(
        "--base-url",
        default=OLLAMA_BASE,
        help=f"Ollama base URL (default: {OLLAMA_BASE})",
    )

    args = parser.parse_args()

    # Apply CLI overrides to runtime globals
    MODEL       = args.model
    OLLAMA_BASE = args.base_url

    run(args.prompt, args.open)


if __name__ == "__main__":
    main()