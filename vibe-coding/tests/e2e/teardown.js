import { rm } from "node:fs/promises";
export default async function () {
  if (process.env.TF_E2E_DATA_DIR)
    await rm(process.env.TF_E2E_DATA_DIR, { recursive: true, force: true });
}
