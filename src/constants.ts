import { RunService } from "@rbxts/services";

export const IS_STUDIO = RunService.IsStudio();
export const IS_EDIT = IS_STUDIO && !RunService.IsRunning();
