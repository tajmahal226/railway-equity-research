"use client";
import Script from "next/script";
import { useCallback, useLayoutEffect, useRef } from "react";
import { useSettingStore } from "@/store/setting";

declare global {
  interface Window {
    eruda: any;
  }
}

function Debugger() {
  const { debug } = useSettingStore();
  const initAttemptedRef = useRef(false);
  const initSuccessRef = useRef(false);

  const logDebugContext = useCallback((event: string, extra: Record<string, unknown> = {}) => {
    console.warn("[Debugger]", {
      event,
      debug,
      readyState:
        typeof document !== "undefined" ? document.readyState : "unknown",
      hasEruda: typeof window !== "undefined" && !!window.eruda,
      initAttempted: initAttemptedRef.current,
      initSuccess: initSuccessRef.current,
      ...extra,
    });
  }, [debug]);

  const setup = useCallback(() => {
    const eruda = window.eruda;
    if (!eruda) {
      logDebugContext("init-skipped-no-eruda");
      return;
    }

    if (initSuccessRef.current) {
      logDebugContext("init-skipped-already-initialized");
      return;
    }

    try {
      initAttemptedRef.current = true;
      eruda.init({
        tool: ["console", "network", "info"],
      });
      initSuccessRef.current = true;
      logDebugContext("init-success");
    } catch (error) {
      logDebugContext("init-failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [logDebugContext]);

  const teardown = useCallback(() => {
    const eruda = window.eruda;
    if (!eruda) {
      logDebugContext("destroy-skipped-no-eruda");
      return;
    }

    if (!initSuccessRef.current) {
      logDebugContext("destroy-skipped-not-initialized");
      return;
    }

    try {
      eruda.destroy();
      initSuccessRef.current = false;
      logDebugContext("destroy-success");
    } catch (error) {
      logDebugContext("destroy-failed", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [logDebugContext]);

  useLayoutEffect(() => {
    logDebugContext("effect-run");
    if (debug === "disable") {
      teardown();
    } else {
      setup();
    }
  }, [debug, logDebugContext, setup, teardown]);

  return debug === "enable" ? (
    <Script
      id="eruda"
      src="/scripts/eruda.min.js"
      onLoad={() => {
        logDebugContext("script-loaded");
        setup();
      }}
    ></Script>
  ) : null;
}

export default Debugger;
