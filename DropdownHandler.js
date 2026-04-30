const DropdownContainers = document.querySelectorAll(".DropdownContainer")

export const ThingsUsed = {
    UsedShapes: [
    "Triangle",
    "Square",
    "Circle"
    ],
    UsedColors: [
    "#ff0000e2",
    "#00ff00",
    "#9000ff"
    ],
    UsedFaces: [
    "HappyFace",
    "AngryFace",
    "SleepyFace"
    ]
}

DropdownContainers.forEach((Container) => {
    const Button = Container.children[0]
    const DropdownArrow = Button.children[1]
    const DropdownOptionsContainer = Container.children[1]
    const List = Button.dataset.list
    Button.addEventListener("click", () => {
        DropdownOptionsContainer.classList.toggle("NotRendered")
        DropdownArrow.classList.toggle("flipped")
    })
    const DropdownOptions = DropdownOptionsContainer.children
    for (let i = 0; i < DropdownOptions.length; i++) {
        const Option = DropdownOptions[i]
        Option.addEventListener("click", () => {
            const Value = Option.dataset.value
            if (ThingsUsed[List].length < 2 && ThingsUsed[List][0] == Value) {
                return
            }
            const img = Option.children[1]
            img.classList.toggle("CheckOff")
            if (ThingsUsed[List].includes(Value)) {
                ThingsUsed[List] = RemoveItem(ThingsUsed[List], Value)
            } else {
                ThingsUsed[List].push(Value)
            }
            console.log(ThingsUsed[List])
        })
    }
})



function RemoveItem(Array, Item) {
    const index = Array.indexOf(Item)
    Array.splice(index, 1)
    return Array
}