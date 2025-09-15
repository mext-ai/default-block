
export interface RegisteredContentDto<T = any> { 
    id: string;
    jsonFilePath: string;
    storeFilePath: string;
    componentPath: string;
    data: T;
}

export class RegisteredContent<T = any>  {
    public id: string;
    public jsonFilePath: string;
    public storeFilePath: string;
    public componentPath: string;
    public data: T;
    constructor(dto: RegisteredContentDto<T>) {
        this.id = dto.id;
        this.jsonFilePath = dto.jsonFilePath;
        this.storeFilePath = dto.storeFilePath;
        this.componentPath = dto.componentPath;
        this.data = dto.data;
        if (window.registeredContents.has(this.id)) return;
        window.registeredContents.set(this.id, this);
        window.parent.postMessage({
            type: 'editor:init',
            payload: {
                storeId: this.id,
                jsonFilePath: this.jsonFilePath,
                storeFilePath: this.storeFilePath,
                componentPath: this.componentPath,
                data: this.data
            }
        }, '*');
    }
    public emitInlineEditEvent(path: string, value: any) {
        window.parent.postMessage({
            type: `editor:inline-update`,
            payload: { storeId: this.id, jsonFilePath: this.jsonFilePath, componentPath: this.componentPath, storeFilePath: this.storeFilePath, path, value }
        }, '*');
    }
}

export const inlineUpdateRegisteredContent = (storeId: string, path: string, value: any) => {
    const store = window.registeredContents.get(storeId);
    if (!store) return;
    store.emitInlineEditEvent(path, value);
}


declare global {
    interface Window {
        registeredContents: Map<string, RegisteredContent<any>>;
        inlineUpdateRegisteredContent: (storeId: string, path: string, value: any) => void;
    }
}

window.registeredContents = new Map();
window.inlineUpdateRegisteredContent = inlineUpdateRegisteredContent;