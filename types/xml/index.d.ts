interface IBody {
    toXmlString(): string;
}

interface IHtml {
    body: IBody;
}

interface IDocument {
    html: IHtml;
}

export const Xml: {
    parse(document: string, flag: boolean): IDocument;
};
