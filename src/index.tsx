// The engine profile shares React and the 3D stack as non-eager singletons, so
// the entry must be an async boundary: nothing here may import them directly.
import("./bootstrap");
