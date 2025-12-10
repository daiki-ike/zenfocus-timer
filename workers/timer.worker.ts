/* eslint-disable no-restricted-globals */
// We need to disable the eslint rule because self is used in workers

self.onmessage = (e: MessageEvent) => {
    const { type } = e.data;

    if (type === 'START') {
        startTimer();
    } else if (type === 'STOP') {
        stopTimer();
    }
};

let intervalId: ReturnType<typeof setInterval> | null = null;

function startTimer() {
    if (intervalId) return; // Already running

    intervalId = setInterval(() => {
        self.postMessage({ type: 'TICK' });
    }, 1000);
}

function stopTimer() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
}
