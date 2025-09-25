import { create } from "zustand";
import BlockStoreData from "./blockStoreData.json";
import { RegisteredContent } from "../utils/registeredContentStore";

/*
    Every type used in the data Dto and its sub elements MUST be one of Number, Text, Iframe, Image, Video, Button, Link, Container
    It is forbidden to create types that use default types such as string, number, boolean, etc.
    IT IS FORBIDDEN TO REWRITE THE blockStore.tsx Text, Image, Video, Button, Link, Container, Iframe, Number content types. 
    It is forbidden to use enums or any other types that are not one of the types defined in the blockStore.tsx file.
*/

export interface Number {
    content: number;
    className?: string;
}

export interface Text {
    content: string;
    className: string;
}

export interface Iframe {
    src: string;
    className: string;
}

export interface Image {
    src: string;
    alt: string;
    className: string;
}

export interface Video {
    src: string;
    alt: string;
    className: string;
}

export interface Button {
    content: string;
    className: string;
}

export interface Link {
    href: string;
    className: string;
    content: string;
}

export interface Container {
    className: string;
}


interface ClickableImagesWithDescription extends Image {
    description: Text;
}

export interface BlockStoreDataDto  {
    layout: {
        main: Container;
    };
    header: {
        section: Container;
        container: Container;
        contentWrapper: Container;
        title: Text;
        description: Text;
    };
    aboutUs: {
        section: Container;
        titleWrapper: Container;
        title: Text;
        description: Text;
        imagesGroup: Container;
        images: ClickableImagesWithDescription[];
    };
    testimonial: {
        section: Container;
        container: Container;
        contentWrapper: Container;
        title: Text;
        description: Text;
        testimonialsGroup: Container;
        testimonials: {
            container: Container;
            contentWrapper: Container;
            image: Image;
            video: Video;
            link: Link;
            button: Button;
        }[]
    };
    spoiler: {
        section: Container;
        container: Container;
        contentWrapper: Container;
        title: Text;
        button: Button;
        description: Text;
        spoilerGroup: Container;
        spoilerContent: {
            container: Container;
            elements: Text[];
        }
    }
}

export interface BlockStore {
    registeredContent: RegisteredContent<BlockStoreDataDto>;
}

const storeId = "block";
const jsonFilePath = "/src/home/blockStoreData.json";
const storeFilePath = "/src/home/blockStore.tsx";
const componentPath = "/src/home/block.tsx";

const registeredComponent = new RegisteredContent<BlockStoreDataDto>({
    id: storeId,
    jsonFilePath,
    storeFilePath,
    componentPath,
    data: BlockStoreData as BlockStoreDataDto
});

export const useBlockStore = create<BlockStore>((set) => ({
    registeredContent: registeredComponent
}));