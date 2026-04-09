import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const First = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const navTimer = setTimeout(() => {
      navigate("/landing", { replace: true });
    }, 5000);

    return () => clearTimeout(navTimer);
  }, [navigate]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#F1F1F1",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Video */}
      <video
        src="/virtual_assistant01.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: "60%",
          height: "60%",
          objectFit: "cover",
          borderRadius: "10px",
          zIndex: 1,
        }}
      />

      {/* Overlay Text */}
      <h1
        style={{
          position: "absolute",
          color: "white",
          fontSize: "42px",
          fontWeight: "bold",
          textAlign: "center",
          zIndex: 2,
          textShadow: "2px 2px 12px rgba(0,0,0,0.9)",
          fontFamily: "Goudy Stout",
        }}
      >
        You Imagine We Build
      </h1>
    </div>
  );
};

export default First;