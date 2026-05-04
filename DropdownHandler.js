const DropdownContainers = document.querySelectorAll(".DropdownContainer")

const MainMenu = document.getElementById("MainMenuContainer")
const DropdownTemp = document.getElementById("DropdownTemplate")
const DropdownButtonTemp = document.getElementById("DropdownButtonTemplate")

const ColorNames = [
    "red",
    "green",
    "purple",
    "pink"
]

export const ThingsUsed = {
    UsedShapes: [
    "Triangle",
    "Square",
    "Circle",
    "Heart"
    ],
    UsedColors: [
    "#ff0000",
    "#00ff00",
    "#7300ff",
    "#ff00fb"
    ],
    UsedFaces: [
    "HappyFace",
    "AngryFace",
    "SleepyFace"
    ]
}

const ListNames = Object.keys(ThingsUsed)
const Lists = Object.values(ThingsUsed)
for (let ListNum = 0; ListNum < Lists.length; ListNum++) {
    let List = Lists[ListNum]
    const ListName = ListNames[ListNum]
    const Dropdown = DropdownTemp.content.cloneNode(true).firstElementChild
    const DropdownButton = Dropdown.querySelector(".DropdownButton") // ATP the only dropdownButton is this one
    DropdownButton.dataset.list = ListName
    const ButtonText = DropdownButton.querySelector("span")
    const ButtonArrow = DropdownButton.querySelector("img")
    ButtonText.textContent = AddSpaces(ListName)
    const DropdownOptionsContainer = Dropdown.querySelector("div")
    Dropdown.style.zIndex = String(Lists.length - ListNum + 1)
    MainMenu.insertBefore(Dropdown, MainMenu.lastElementChild)
    DropdownButton.addEventListener("click", () => {
        DropdownOptionsContainer.classList.toggle("NotRendered")
        ButtonArrow.classList.toggle("flipped")
    })
    for (let ListIndex = 0; ListIndex < List.length; ListIndex++) {
        const NewButton = DropdownButtonTemp.content.cloneNode(true).firstElementChild
        NewButton.dataset.value = List[ListIndex]
        const Span = NewButton.querySelector("span")
        if (ListNames[ListNum] == "UsedColors") {
            Span.textContent = ColorNames[ListIndex]
        } else {
            Span.textContent = AddSpaces(List[ListIndex]).toLowerCase()
        }
        const CheckBox = NewButton.querySelector("img")
        NewButton.addEventListener("click", () => {
            const Value = NewButton.dataset.value
            if (List.length < 2 && List[0] == Value) {
                return
            }

            CheckBox.classList.toggle("CheckOff")
            if (List.includes(Value)) {
                List = RemoveItem(List, Value)
            } else {
                List.push(Value)
            }
        })
        DropdownOptionsContainer.appendChild(NewButton)
    }
}

function AddSpaces(str) {
    return str.replace(/([A-Z])/g, ' $1').trim();
}

function RemoveItem(Array, Item) {
    const index = Array.indexOf(Item)
    Array.splice(index, 1)
    return Array
}
