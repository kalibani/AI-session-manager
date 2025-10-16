import "@testing-library/jest-dom";

// Polyfill for Web Streams API (required by AI SDK)
import { ReadableStream, TransformStream } from "node:stream/web";

global.ReadableStream = ReadableStream as any;
global.TransformStream = TransformStream as any;
