export function getElementsByClassName(element, classToFind: string) {
    const data = [];
    const descendantList = element.getDescendants();
    descendantList.push(element);
    for (const descendant of descendantList) {
        const elt = descendant.asElement();
        if (elt != null) {
            let classes = elt.getAttribute("class");
            if (classes !== null) {
                classes = classes.getValue();
                if (classes === classToFind) {
                    data.push(elt);
                } else {
                    classes = classes.split(" ");
                    for (const j in classes) {
                        if (classes[j] === classToFind) {
                            data.push(elt);
                            break;
                        }
                    }
                }
            }
        }
    }
    return data;
}

export function getElementsByTagName(element, tagName: string) {
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
