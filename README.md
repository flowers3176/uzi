# UZI
## * Current Components
* Frame (Supports Gradient and Border)
* Border
* Corner (Has normal Behavior)
* Group (Ty littensy)
* Image (Supports gradients)
* Input (Supports GuiObjects)
* Layer (Ty littensy)
* TextLabel (Supports CustomFont)
* Transition (Ty littensy)

## * Current Modifers (classes)
* CustomFont (Currently only scale to fit) DOESNT SUPPORT SOME CHARACTERS
*  Gradient

## * Up next
* CanvasFrame 
* TextSize for custom fonts
* Bug fixes

## * Notes
* Doesn't Support Fonts that go over their BaseLine
* Everything is Centered and has a default size (subject to change)

## * How to use CustomFont 
This is the website where you generate the SpriteSheet and JSON that's needed
https://kodaloid.com/tools/sprite-font-generator/
Don't forget to turn off Flip Y Cordinate in Options and tweak the canvas size and font size to get a high res font, (don't go above 1024x1024).
Then copy the JSON and get an assetId from the downloaded image and use the class like the following 
```ts
import data from "./jetBrainsMono.data";
import { CustomFont } from "../../utils/customFont";
export const JetBrainsMono = new CustomFont("rbxassetid://96002929695676", data);
```