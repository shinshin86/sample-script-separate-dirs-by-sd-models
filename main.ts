import { getInfotextJson } from "chilled-lemon";
import fs from "fs/promises";
import path from "path";

const dirExists = async(dirPath: string): Promise<boolean> => {
    try {
        await fs.access(dirPath);
        return true;
    } catch {
        return false;
    }
}

const createDirIfNotExists = async (dirName: string): Promise<void> => {
    if (await dirExists(dirName)) {
        console.log(`${dirName} already exists.`);
    } else {
        await fs.mkdir(dirName);
        console.log(`${dirName} was created.`);
    }
} 

const moveFile = async(sourcePath: string, destPath: string): Promise<void> => {
    try {
        await fs.rename(sourcePath, destPath);
        console.log(`Moved: ${sourcePath} -> ${destPath}`);
    } catch(error) {
        console.error(`Failed to move file from ${sourcePath} to ${destPath}: `, error);
    }
}

const main = async(dirPath: string): Promise<void> => {
    try {
        const files = await fs.readdir(dirPath);
        const targetExt = ".png";

        const imageFiles = files.filter(file => path.extname(file).toLocaleLowerCase() === targetExt);
    
        for(const image of imageFiles) {
            const imagePath = path.resolve(path.join(dirPath, image))
            const buf: Buffer = await fs.readFile(imagePath)
            const json = await getInfotextJson(buf);

            if(!json.model) {
                console.log('Not found model name');
                continue;
            }

            const targetDir = path.resolve(path.join(dirPath, json.model));
            await createDirIfNotExists(targetDir)
            await moveFile(imagePath, path.join(targetDir, image));
        }
    } catch(error) {
        console.error("Failed to process files in the directory: ", error);
    }
}

const dirPath = Bun.argv[2] || '.';
console.log("target dir: ", dirPath);
main(dirPath);