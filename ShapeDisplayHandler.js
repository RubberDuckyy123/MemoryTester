import { ThingsUsed } from "./DropdownHandler.js"

const StartButton = document.getElementById("StartButton")
const MainMenu = document.getElementById("MainMenuContainer")

const GameContainer = document.getElementById("GameContainer")
const ShapeDisplay = document.getElementById("ShapeDisplay")
const ctx = ShapeDisplay.getContext("2d")

const UtilCanvas = document.getElementById("UtilCanvas")
const Uctx = UtilCanvas.getContext("2d")

const MemorizeButton = document.getElementById("MemorizeButton")

const OptionLabel = document.getElementById("OptionLabel")
const OptionContainer = document.getElementById("OptionContainer")

const ReturnToMenuButton = document.getElementById("ReturnToMenuButton")

ctx.imageSmoothingEnabled = false

const ShapeSize = 64
const Padding = 10

UtilCanvas.width = ShapeSize
UtilCanvas.height = ShapeSize

let Shapes = {}
let ShapeFaces = {}

const OGShapes = ThingsUsed.UsedShapes
const OGFaces = ThingsUsed.UsedFaces
for (let i = 0; i < OGShapes.length; i++) {
    Shapes[OGShapes[i]] = new Image()
    Shapes[OGShapes[i]].src = "Shapes/" + OGShapes[i] + ".png"
}
for (let i = 0; i < OGFaces.length; i++) {
    ShapeFaces[OGFaces[i]] = new Image()
    ShapeFaces[OGFaces[i]].src = "Faces/" + OGFaces[i] + ".png"
}

const FaceYOffset = 8
let ShapesPerRow

let PossibleShapes = []
let PossibleColors = []
let PossibleFaces = []

const GameState = {
    State: "memorizing",
    NumberOfShapes: 1,
    ShapeSequence: [],
    GuessesRemaining: 20,
    CurrentGuess: {
        Shape: null,
        Color: null,
        Face: null
    },
    SelectedShape: null
}

const Cooldown = 500 // ms

const OptionButtonElements = {
    Shape: [],
    Color: [],
    Face: []
}

const OptionButtonEventHandlers = []

const QuestionMark = new Image()
QuestionMark.src = "QuestionMark.png"

const Wrong = new Image()
Wrong.src = "Wrong.png"

StartButton.addEventListener("click", () => {
    MainMenu.classList.add("NotRendered")
    GameContainer.classList.remove("NotRendered")
    ShapesPerRow = Math.min(Math.floor((window.innerWidth + Padding) / (ShapeSize + Padding)), 25)
    ShapeDisplay.width = GetRowWidth(ShapesPerRow)
    GameContainer.style.width = ShapeDisplay.width + "px"
    PossibleShapes = ThingsUsed.UsedShapes
    PossibleColors = ThingsUsed.UsedColors
    PossibleFaces = ThingsUsed.UsedFaces
    BeginRound()
    InitializeOptionButtons(PossibleShapes, true, "Shape")
    InitializeOptionButtons(PossibleColors, false, "Color")
    InitializeOptionButtons(PossibleFaces, true, "Face")
    GameContainer.style.height = "auto"

    const AllOptionButtons = [...OptionButtonElements.Shape, ...OptionButtonElements.Color, ...OptionButtonElements.Face]
    AllOptionButtons.forEach((Button) => {
        const handler = (e) => HookUpOptionButtons(e, Button)
        OptionButtonEventHandlers.push(handler)
        Button.addEventListener("click", handler)
    })
})

ShapeDisplay.addEventListener("click", (e) => {
    if (GameState.State != "guessing") {
        return
    }

    const DisplayRect = ShapeDisplay.getBoundingClientRect()
    const y = e.clientY - DisplayRect.top
    const YShape = Math.floor(y / (ShapeSize + Padding))

    const Row = GameState.ShapeSequence[YShape]

    const x = e.clientX - DisplayRect.left - Row.StartPos
    const XShape = Math.floor(x / (ShapeSize + Padding))
    const ShapeList = Row.ShapeList
 
    if (XShape in ShapeList) {
        const SelectionLeft = DisplayRect.left + Row.StartPos + XShape * (ShapeSize + Padding)
        const SelectionTop = DisplayRect.top + YShape * (ShapeSize + Padding)
        SetupSelectionUI(5, "white")
        GameState.SelectedShape = {StartPos: {Left: SelectionLeft - DisplayRect.left, Top: SelectionTop - DisplayRect.top}, Shape: ShapeList[XShape]}
        UtilCanvas.style.left = SelectionLeft + "px"
        UtilCanvas.style.top = SelectionTop + "px"
        UtilCanvas.classList.remove("invisible")
        OptionLabel.classList.remove("invisible")
        OptionContainer.classList.remove("invisible")
        for (let i = 0; i < OptionButtonElements.Shape.length; i++) {
            OptionButtonElements.Shape[i].classList.remove("NotRendered")
            OptionLabel.textContent = "--Shapes--"
        }
    } else {
        console.log("Thats not a shape :(")
    }
})

MemorizeButton.addEventListener("click", () => {
    MemorizeButton.classList.add("NotRendered")
    OptionLabel.classList.remove("NotRendered")
    OptionContainer.classList.remove("NotRendered")
    DrawQuestionMarks()
    GameState.State = "guessing"
})

ReturnToMenuButton.addEventListener("click", () => {
    ReturnToMenuButton.classList.add("NotRendered")
    EndGame()
})

function HookUpOptionButtons(event, Button) {
    const Names = Object.keys(OptionButtonElements)
    const Lists = Object.values(OptionButtonElements)
    const index = Names.indexOf(Button.dataset.type)
    const ListToHide = Lists[index]
    for (let i = 0; i < ListToHide.length; i++) {
            ListToHide[i].classList.add("NotRendered")
    }
    if (Button.dataset.type == "Face") {
        OptionLabel.classList.add("invisible")
        OptionLabel.textContent = "--" + "Shapes" + "--"
        GameState.CurrentGuess["Face"] = Button.dataset.value
        const ThingsToCheck = Object.keys(GameState.SelectedShape.Shape)
        Uctx.clearRect(0, 0, UtilCanvas.width, UtilCanvas.height)
        for (let i = 0; i < ThingsToCheck.length; i++) {
            if (GameState.CurrentGuess[ThingsToCheck[i]] != GameState.SelectedShape.Shape[ThingsToCheck[i]]) {
                const CurrentStartPos = GameState.SelectedShape.StartPos
                ctx.clearRect(CurrentStartPos.Left, CurrentStartPos.Top, 64, 64)
                ctx.drawImage(Wrong, CurrentStartPos.Left, CurrentStartPos.Top)
                GameContainer.style.height = String(GameContainer.getBoundingClientRect().height) + "px"
                setTimeout(() => {
                    ReturnToMenuButton.classList.remove("NotRendered")
                }, 2000)
                return
            }
        }
        const ActualShape = GameState.SelectedShape.Shape
        const StartPos = GameState.SelectedShape.StartPos
        const ShapeToDraw = Shapes[ActualShape.Shape]
        const FaceToDraw = ShapeFaces[ActualShape.Face]
        ctx.clearRect(StartPos.Left, StartPos.Top, ShapeSize, ShapeSize)
        DrawTintedImage(ShapeToDraw, ActualShape.Color, StartPos.Left, StartPos.Top)
        ctx.drawImage(FaceToDraw, StartPos.Left + ShapeSize / 2 - FaceToDraw.width / 2, StartPos.Top + ShapeSize - FaceToDraw.height - FaceYOffset)
        SetupSelectionUI(5, "white")
        GameState.GuessesRemaining -= 1
        if (GameState.GuessesRemaining == 0) {
            GameState.NumberOfShapes += 1
            BeginRound()
        }
        return
    }
    const ListToPrompt = Lists[index + 1]  // +1 because Next Thing to Prompt
    OptionLabel.textContent = "--" + Names[index + 1].replace(/([A-Z])/g, " $1").trim() + "--"
    GameState.CurrentGuess[Names[index]] = Button.dataset.value
    for (let i = 0; i < ListToPrompt.length; i++) {
        ListToPrompt[i].classList.remove("NotRendered")
    }
}

async function BeginRound() {
    ctx.clearRect(0, 0, ShapeDisplay.width, ShapeDisplay.height)
    Uctx.clearRect(0, 0, UtilCanvas.width, UtilCanvas.height)
    GameState.State = "memorizing"
    GameState.ShapeSequence = []
    GameState.GuessesRemaining = 0
    OptionLabel.classList.add("NotRendered")
    OptionContainer.classList.add("NotRendered")
    UtilCanvas.classList.add("invisible")
    const NumberOfRows = Math.max(Math.ceil(GameState.NumberOfShapes / ShapesPerRow), 1)
    ShapeDisplay.height = GetRowWidth(NumberOfRows)
    for (let i = 0; i < NumberOfRows; i++) {
        const AmountToDraw = Math.min(GameState.NumberOfShapes - ShapesPerRow * i, ShapesPerRow)
        const RowWidth = GetRowWidth(AmountToDraw)
        const StartXPos = (ShapeDisplay.width - RowWidth) / 2
        GameState.ShapeSequence[i] = {StartPos: StartXPos, ShapeList: []}
        for (let j = 0; j < AmountToDraw; j++) {
            GameState.GuessesRemaining += 1
            await wait(Cooldown)
            DrawShape(StartXPos, j, i)
        }
    }
    SetupSelectionUI(5, "white")
    await wait(1000)
    MemorizeButton.classList.remove("NotRendered")
}

function EndGame() {
    ctx.clearRect(0, 0, ShapeDisplay.width, ShapeDisplay.height)
    Uctx.clearRect(0, 0, UtilCanvas.width, UtilCanvas.height)
    GameState.State = "memorizing"
    GameState.ShapeSequence = []
    GameState.GuessesRemaining = 0
    GameState.NumberOfShapes = 1
    OptionLabel.classList.add("NotRendered")
    OptionContainer.classList.add("NotRendered")
    UtilCanvas.classList.add("invisible")
    const AllOptionButtons = [...OptionButtonElements.Shape, ...OptionButtonElements.Color, ...OptionButtonElements.Face]
    AllOptionButtons.forEach((Button, index) => {
        Button.removeEventListener("click", OptionButtonEventHandlers[index])
    })
    const ButtonKeys = Object.keys(OptionButtonElements)
    for (let i = 0; i < ButtonKeys.length; i++) {
        OptionButtonElements[ButtonKeys[i]] = []
    }
    GameContainer.classList.toggle("NotRendered")
    MainMenu.classList.toggle("NotRendered")
}

function DrawShape(StartX, XNum, YNum) {
    const ShapePosition = GetShapePosition(StartX, XNum, YNum)
    const XPos = ShapePosition[0]
    const YPos = ShapePosition[1]
    const ShapeNum = Math.floor(Math.random() * PossibleShapes.length)
    const ChosenShape = Shapes[PossibleShapes[ShapeNum]]
    const ColorNum = Math.floor(Math.random() * PossibleColors.length)
    const ChosenColor = PossibleColors[ColorNum]
    const FaceNum = Math.floor(Math.random() * PossibleFaces.length)
    const ChosenFace = ShapeFaces[PossibleFaces[FaceNum]]
    
    DrawTintedImage(ChosenShape, ChosenColor, XPos, YPos)

    ctx.drawImage(ChosenFace, XPos + ShapeSize / 2 - ChosenFace.width / 2, YPos + ShapeSize - ChosenFace.height - FaceYOffset)

    GameState.ShapeSequence[YNum].ShapeList.push({Shape: PossibleShapes[ShapeNum], Color: ChosenColor, Face: PossibleFaces[FaceNum]})
}

function DrawTintedImage(img, color, XPos, YPos) {
    Uctx.clearRect(0, 0, UtilCanvas.width, UtilCanvas.height)

    Uctx.drawImage(img, 0, 0)

    Uctx.globalCompositeOperation = "multiply"
    Uctx.fillStyle = color
    Uctx.fillRect(0, 0, UtilCanvas.width, UtilCanvas.height)

    Uctx.globalCompositeOperation = "destination-in"
    Uctx.drawImage(img, 0, 0)

    Uctx.globalCompositeOperation = "source-over";

    ctx.drawImage(UtilCanvas, XPos, YPos)
}

function InitializeOptionButtons(List, ContainImage=false, Thing) {
    if (ContainImage) {
        for (let i = 0; i < List.length; i++) {
            const Button = document.createElement("button")
            Button.classList.add("MemoryOption")
            const Image = document.createElement("img")
            Image.src = Thing + "s" + "/" + List[i] + ".png"
            Button.appendChild(Image)
            Button.dataset.type = Thing
            Button.dataset.value = List[i]
            Button.classList.add(Thing)
            Button.classList.add("NotRendered")
            OptionButtonElements[Thing].push(Button)
            OptionContainer.appendChild(Button)
        }    
    } else {
        for (let i = 0; i < List.length; i++) {
            const Button = document.createElement("button")
            Button.classList.add("MemoryOption")
            Button.style.backgroundColor = List[i]
            Button.dataset.type = Thing
            Button.dataset.value = List[i]
            Button.classList.add(Thing)
            Button.classList.add("NotRendered")
            OptionButtonElements[Thing].push(Button)
            OptionContainer.appendChild(Button)
        }   
    }
}

function DrawQuestionMarks() {
    ctx.clearRect(0, 0, ShapeDisplay.width, ShapeDisplay.height)
    for (let i = 0; i < GameState.ShapeSequence.length; i++) {
        const Row = GameState.ShapeSequence[i]
        const StartPos = Row.StartPos
        const AmountToDraw = Row.ShapeList.length
        for (let j = 0; j < AmountToDraw; j++) {
            const ShapePosition = GetShapePosition(StartPos, j, i)
            const XPos = ShapePosition[0]
            const YPos = ShapePosition[1]
            ctx.drawImage(QuestionMark, XPos, YPos)
        }
    }
}

function SetupSelectionUI(Width, Color) {
    Uctx.fillStyle = Color
    Uctx.clearRect(0, 0, UtilCanvas.width, UtilCanvas.height)
    Uctx.fillRect(0, 0, UtilCanvas.width, UtilCanvas.height)
    Uctx.clearRect(Width, Width, UtilCanvas.width - Width * 2, UtilCanvas.height - Width * 2)
}

function GetRowWidth(Amount) {
    return (ShapeSize + Padding) * Amount - Padding
}

function GetShapePosition(StartX, XNum, YNum) {
    const XPos = StartX + XNum * ShapeSize + XNum * Padding
    const YPos = YNum * ShapeSize + YNum * Padding
    return [XPos, YPos]
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}