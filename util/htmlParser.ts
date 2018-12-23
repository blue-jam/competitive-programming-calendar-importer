import Element = GoogleAppsScript.XML_Service.Element;

export function getElementsByClassName(element: Element, classToFind: string): Element[] {
    const data = [];
    const descendantList = element.getDescendants()
        .map((content) => content.asElement());
    descendantList.push(element);

    for (const descendant of descendantList) {
        if (descendant == null) {
            continue;
        }

        const classes = descendant.getAttribute("class");

        if (classes === null) {
            continue;
        }

        const classList = classes.getValue().split(" ");

        if (classList.indexOf(classToFind) !== -1) {
            data.push(descendant);
        }
    }

    return data;
}

export function getElementsByTagName(element: Element, tagName: string): Element[] {
    const data = [];
    const descendantList = element.getDescendants();
    for (const descendant of descendantList) {
        const elt = descendant.asElement();
        if (elt !== null && elt.getName() === tagName) {
            data.push(elt);
        }
    }

    return data;
}
