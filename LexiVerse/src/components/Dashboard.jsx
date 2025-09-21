/**
 * Compatibility shim (final)
 *
 * This file intentionally exports the new page and re-exports the 3D model
 * component to preserve any existing imports. The original Dashboard
 * implementation is intentionally removed from this file and is available in
 * the git history if needed.
 */

import DashboardPage from "../pages/DashboardPage";
import ThreeDModel from "./ThreeDModel";

export { ThreeDModel };
export default DashboardPage;
