import React from 'react';

export default function Loader() {
  return (
    <div className="global-loader-wrapper flex justify-center items-center w-full min-h-[calc(100vh-120px)]">
      <div className="loader-container">
        <div className="loader" aria-label="Loading" role="status" />
      </div>
      <style>{`
        .loader-container {
          position: relative;
          width: 120px;
          height: 90px;
          margin: 0 auto;
        }

        .loader-container .loader {
          position: absolute;
          inset: 0;
        }

        .loader-container .loader:before {
          content: "";
          position: absolute;
          bottom: 30px;
          left: 50px;
          height: 30px;
          width: 30px;
          border-radius: 50%;
          background: #4A6750;
          animation: loading-bounce 0.5s ease-in-out infinite alternate;
        }

        .loader-container .loader:after {
          content: "";
          position: absolute;
          right: 0;
          top: 0;
          height: 7px;
          width: 45px;
          border-radius: 4px;
          /* 4 shadows to exactly match the animation keyframes */
          box-shadow: 0 10px 0 rgba(0,0,0,0), 0 5px 0 var(--loader-stair, #d6d3d1), -35px 50px 0 var(--loader-stair, #d6d3d1), -70px 95px 0 var(--loader-stair, #d6d3d1);
          animation: loading-step 1s ease-in-out infinite;
        }

        @keyframes loading-bounce {
          0% { transform: scale(1, 0.7); }
          40% { transform: scale(0.8, 1.2); }
          60% { transform: scale(1, 1); }
          100% { bottom: 140px; }
        }

        @keyframes loading-step {
          0% {
            box-shadow: 0 10px 0 rgba(0, 0, 0, 0),
                    0 10px 0 var(--loader-stair, #d6d3d1),
                    -35px 50px 0 var(--loader-stair, #d6d3d1),
                    -70px 90px 0 var(--loader-stair, #d6d3d1);
          }
          100% {
            box-shadow: 0 10px 0 var(--loader-stair, #d6d3d1),
                    -35px 50px 0 var(--loader-stair, #d6d3d1),
                    -70px 90px 0 var(--loader-stair, #d6d3d1),
                    -70px 90px 0 rgba(0, 0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
