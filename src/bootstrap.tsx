import { chestDemoDefinition } from "@mexty/engine-schema";
import { mount } from "./App";

// Local development (`npm run dev`) and standalone exports mount into #root
// with the demo definition. The platform mounts through the federation
// container instead, passing the saved props as the definition.
const container = document.getElementById("root");
if (container) mount(container, chestDemoDefinition);
