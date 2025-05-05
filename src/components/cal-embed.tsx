"use client";

import React, { useEffect } from 'react';

declare global {
  interface Window {
    Cal: any; // Define Cal type on window object
  }
}

interface CalEmbedProps {
  calLink: string;
  elementId?: string;
}

const CalEmbed: React.FC<CalEmbedProps> = ({ calLink, elementId = "my-cal-inline" }) => {
  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      // Check if Cal script is already loaded or being loaded
      if (!window.Cal || !window.Cal.loaded) {
        (function (C, A, L) {
          let p = function (a: any, ar: any) {
            a.q.push(ar);
          };
          let d = C.document;
          C.Cal = C.Cal || function () {
            let cal = C.Cal;
            let ar = arguments;
            if (!cal.loaded) {
              cal.ns = {};
              cal.q = cal.q || [];
              const script = d.createElement("script");
              script.src = A;
              script.async = true; // Load async
              d.head.appendChild(script);
              cal.loaded = true;
            }
            if (ar[0] === L) {
              const api = function () {
                p(api, arguments);
              };
              const namespace = ar[1];
              api.q = api.q || [];
              if(typeof namespace === "string"){
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ["initNamespace", namespace]);
              } else p(cal, ar);
              return;
            }
            p(cal, ar);
          };
        })(window, "https://app.cal.com/embed/embed.js", "init");

        window.Cal("init", { origin: "https://cal.com" }); // Initialize base Cal
      }

      // Initialize the specific namespace and embed
       // Use a unique namespace based on elementId or calLink to avoid conflicts
      const namespace = calLink.replace(/[^a-zA-Z0-9]/g, '') || 'defaultCalNs';

      window.Cal("init", namespace, { origin: "https://cal.com" }); // Initialize namespace

      // Ensure the element exists before trying to embed
      const intervalId = setInterval(() => {
        if (document.getElementById(elementId)) {
          clearInterval(intervalId);
          window.Cal.ns[namespace]("inline", {
            elementOrSelector: `#${elementId}`,
            config: { "layout": "month_view" }, // Configuration passed here
            calLink: calLink,
          });
          window.Cal.ns[namespace]("ui", { "hideEventTypeDetails": false, "layout": "month_view" });
        }
      }, 100); // Check every 100ms

      // Cleanup function for when the component unmounts
      return () => {
        clearInterval(intervalId);
        // Optional: Add cleanup logic if Cal.com provides it
        const calElement = document.getElementById(elementId);
        if (calElement) {
          calElement.innerHTML = ''; // Clear the embed container
        }
         // Consider if namespace cleanup is needed, though Cal.com might handle it
      };
    }
  }, [calLink, elementId]); // Re-run effect if calLink or elementId changes

  return (
    <div
      style={{ width: '100%', height: '100%', overflow: 'auto' }} // Changed overflow to auto
      id={elementId}
    ></div>
  );
};

export default CalEmbed;
