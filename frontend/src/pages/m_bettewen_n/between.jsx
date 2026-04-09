import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Between = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      navigate("/overview", { replace: true });
    }, 8050);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div style={{ position: "relative", height: "100vh", overflow: "hidden", background: "#000" }}>
      {/* Full-screen autoplay video */}
      <video
        src="/Bumblebee_Transformation_CGI_Video.mp4"
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default Between;