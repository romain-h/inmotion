import { useEffect } from 'react';

const useDocumentEventListener = (
  eventName: string,
  listener: EventListenerOrEventListenerObject,
) => {
  useEffect(() => {
    window.document.addEventListener(eventName, listener, true);
    return () => window.document.removeEventListener(eventName, listener, true);
  }, [eventName, listener]);
};

export { useDocumentEventListener };
