import { create } from "zustand";
import FeatureStoreData from "./featuresStoreData.json";
import { RegisteredContent } from "../utils/registeredContentStore";
import { Container, Text } from "../home/blockStore";

export interface FeatureStoreDataDto  {
    features: {
        section: Container;
        container: Container;
        contentWrapper: Container;
        title: Text;
        description: Text;
        featuresGroup: Container;
        features: {
            title: Text;
            description: Text;
            container: Container;
        }[];
    }
}

export interface FeatureStore {
    registeredContent: RegisteredContent<FeatureStoreDataDto>;
}

const storeId = "features";
const jsonFilePath = "/src/features/featuresStoreData.json";
const storeFilePath = "/src/features/featuresStore.tsx";
const componentPath = "/src/features/features.tsx";

const registeredComponent = new RegisteredContent<FeatureStoreDataDto>({
    id: storeId,
    jsonFilePath,
    storeFilePath,
    componentPath,
    data: FeatureStoreData as FeatureStoreDataDto
});

export const useFeatureStore = create<FeatureStore>((set) => ({
    registeredContent: registeredComponent
}));