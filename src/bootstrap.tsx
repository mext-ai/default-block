import { mount } from "./App";

// Local development and standalone exports: mount the primitive's preview.
const container = document.getElementById("root");
if (container) mount(container, {});
