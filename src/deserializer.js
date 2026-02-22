class PlayerDeserializer {

    #ENCRYPTION_KEY = this.#utf16leBytes("h3y_gUyZ");

    #FileType = { None: 0, Map: 1, World: 2, Player: 3 };

    #FileTypeNames = Object.fromEntries(
        Object.entries(this.#FileType).map(([k, v]) => [v, k])
    );

    async deserializePlayer(encryptedPlayerFile) {
        let decryptedPlayerFile;
        try {
            decryptedPlayerFile = await this.#decrypt(encryptedPlayerFile);
        } catch (error) {
            alert("Error. Could't parse the file: " + error.message);
            throw error;
        }

        const reader = new BinaryReader(new Uint8Array(decryptedPlayerFile));

        const releaseVersion = reader.readInt32();

        try {
            const metadata = this.#readMetadata(reader, this.#FileType.Player);
        } catch (error) {
            alert("Error. Couldn't read the file metadata: " + error.message);
            throw error;
        }

        let playerData;
        try {
            playerData = this.#deserialize(reader, releaseVersion);
        } catch (error) {
            console.log(error);
            alert("Error during deserializing (look in the developer console for the details): " + error.message);
            throw error;
        }
        return playerData;
    }

    #deserialize(reader, releaseVersion) {
        const newPlayer = {};

        newPlayer.name = reader.readString();

        if (releaseVersion >= 10) {
            if (releaseVersion >= 17) {
                reader.readByte();
            } else {
                reader.readBoolean();
            }
        }

        if (releaseVersion >= 138) {
            reader.readInt64();
        }

        reader.readInt32();

        if (releaseVersion >= 82) {
            reader.readByte();
        }
        if (releaseVersion >= 283) {
            reader.readByte();
        }

        if (releaseVersion >= 124) {
            reader.readByte();
            reader.readByte();
        } else if (releaseVersion >= 83) {
            reader.readByte();
        }

        if (releaseVersion >= 119) {
            reader.readByte();
        }

        if (releaseVersion < 107) {
            reader.readBoolean();
        } else {
            reader.readByte();
        }

        reader.readInt32();
        reader.readInt32();

        reader.readInt32();
        reader.readInt32();

        if (releaseVersion >= 125) {
            reader.readBoolean();
        }

        if (releaseVersion >= 229) {
            reader.readBoolean();
            reader.readBoolean();
            if (releaseVersion >= 256) {
                reader.readBoolean();
            }
            if (releaseVersion >= 260) {
                reader.readBoolean();
                reader.readBoolean();
                reader.readBoolean();
                reader.readBoolean();
                reader.readBoolean();
                reader.readBoolean();
            }
        }

        if (releaseVersion >= 182) {
            reader.readBoolean();
        }

        if (releaseVersion >= 128) {
            reader.readInt32();
        }

        if (releaseVersion >= 254) {
            reader.readInt32();
            reader.readInt32();
        }

        reader.readRGB();
        reader.readRGB();
        reader.readRGB();
        reader.readRGB();
        reader.readRGB();
        reader.readRGB();
        reader.readRGB();

        if (releaseVersion >= 38) {
            if (releaseVersion < 124) {
                let num = 11;
                if (releaseVersion >= 81) {
                    num = 16;
                }
                for (let index1 = 0; index1 < num; ++index1) {
                    reader.readInt32();
                    reader.readByte();
                }
            } else {
                for (let index = 0; index < 20; ++index) {
                    reader.readInt32();
                    reader.readByte();
                }
            }

            if (releaseVersion >= 47) {
                let num = 3;
                if (releaseVersion >= 81) {
                    num = 8;
                }
                if (releaseVersion >= 124) {
                    num = 10;
                }
                for (let index3 = 0; index3 < num; ++index3) {
                    reader.readInt32();
                    reader.readByte();
                }
            }

            if (releaseVersion >= 58) {
                for (let index = 0; index < 58; ++index) {
                    reader.readInt32();
                    reader.readInt32();
                    reader.readByte();
                    if (releaseVersion >= 114) {
                        reader.readBoolean();
                    }
                }
            } else {
                for (let index = 0; index < 48; ++index) {
                    reader.readInt32();
                    reader.readInt32();
                    reader.readByte();
                }
            }

            if (releaseVersion >= 117) {
                for (let index = 0; index < 5; ++index) {
                    reader.readInt32();
                    reader.readByte();
                    reader.readInt32();
                    reader.readByte();
                }
            }

            if (releaseVersion >= 58) {
                for (let index = 0; index < 80; ++index) {
                    reader.readInt32();
                    reader.readInt32();
                    reader.readByte();
                }
            } else {
                for (let index = 0; index < 40; ++index) {
                    reader.readInt32();
                    reader.readInt32();
                    reader.readByte();
                }
            }

            if (releaseVersion >= 182) {
                for (let index = 0; index < 40; ++index) {
                    reader.readInt32();
                    reader.readInt32();
                    reader.readByte();
                }
            }

            if (releaseVersion >= 198) {
                for (let index = 0; index < 40; ++index) {
                    reader.readInt32();
                    reader.readInt32();
                    reader.readByte();
                    if (releaseVersion >= 255) {
                        reader.readBoolean();
                    }
                }
            }

            if (releaseVersion >= 199) {
                reader.readByte();
            }
        }

        const buffType = [];
        const buffTime = [];
        if (releaseVersion >= 11) {
            let num = 22;
            if (releaseVersion < 74) {
                num = 10;
            }
            if (releaseVersion >= 252) {
                num = 44;
            }

            for (let index = 0; index < num; ++index) {
                buffType[index] = reader.readInt32();
                buffTime[index] = reader.readInt32();
                if (buffType[index] == 0) {
                    --index;
                    --num;
                }
            }
        }

        for (let index = 0; index < 200; ++index) {
            let num = reader.readInt32();
            if (num != -1) {
                reader.readInt32();
                reader.readInt32();
                reader.readString();
            } else {
                break;
            }
        }

        if (releaseVersion >= 16) {
            reader.readBoolean();
        }

        if (releaseVersion >= 115) {
            for (let index = 0; index < 13; ++index) {
                reader.readBoolean();
            }
        }

        if (releaseVersion >= 98) {
            reader.readInt32();
        }

        if (releaseVersion >= 162) {
            for (let index = 0; index < 4; ++index) {
                reader.readInt32();
            }
        }

        if (releaseVersion >= 164) {
            let num = 8;
            if (releaseVersion >= 167) {
                num = 10;
            }
            if (releaseVersion >= 197) {
                num = 11;
            }
            if (releaseVersion >= 230) {
                num = 12;
            }
            for (let index = 0; index < num; ++index) {
                reader.readInt32();
            }
        }

        if (releaseVersion >= 181) {
            reader.readInt32();
        }

        if (releaseVersion >= 200) {
            const dead = reader.readBoolean();
            if (dead) {
                reader.readInt32();
            }
        }

        if (releaseVersion >= 202) {
            reader.readInt64();
        }

        if (releaseVersion >= 206) {
            reader.readInt32();
        }

        if (releaseVersion >= 218) {
            newPlayer.researchProgress = this.#getResearchProgess(reader, releaseVersion);
        }

        return newPlayer;
    }

    #getResearchProgess(reader, gameVersionSaveWasMadeOn) {
        const researchProgress = {};

        if (gameVersionSaveWasMadeOn >= 282) {
            reader.readBoolean();
        }


        let researchedItems = reader.readInt32();

        const allItemsCopy = structuredClone(allItems);

        const unknownItems = [];

        for (let index = 0; index < researchedItems; ++index) {
            let researchedItemInternalName;
            let researchedItemAmount;
            try {
                researchedItemInternalName = this.#fixItemInternalNames(reader.readString());
                researchedItemAmount = reader.readInt32();

                const item = allItemsCopy.find(item => item.internalName == researchedItemInternalName);
                if (item) {
                    item.researched = researchedItemAmount;
                    item.fullyResearched = researchedItemAmount >= item.neededForResearch;
                } else {
                    unknownItems.push(researchedItemInternalName);
                }
            } catch (error) {
                console.log(error);
                alert("Could not process item with internal name '" + researchedItemInternalName + "' and with amount '" + researchedItemAmount + "'");
            }
        }

        if (unknownItems.length > 0) {
            alert("These unknown items are ignored:\n\n" + unknownItems.join("\n"));
        }

        this.#addResearchOverride(allItemsCopy);

        researchProgress.items = allItemsCopy;

        return researchProgress;
    }

    #fixItemInternalNames(itemInternalName) {
        switch (itemInternalName) {
            case "EldMelter": return "ElfMelter";
            case "ThisIsCanonNow": return "BrasilianSkies";
            default: return itemInternalName;
        }
    }

    #addResearchOverride(items) {
        const mapping = {
            4131: [5325],
            5324: [5329, 5330],
            5437: [5358, 5359, 5360, 5361],
            4346: [5391],
            4767: [5453],
            5309: [5454],
            5323: [5455],
            5526: [2611]
        };

        const lookup = Object.fromEntries(items.map(item => [item.id, item]));

        items.forEach(item => {
            if (item.fullyResearched && mapping[item.id]) {
                mapping[item.id].forEach(id => {
                    if (lookup[id]) {
                        lookup[id].fullyResearched = true;
                        lookup[id].researched = item.researched;
                    }
                })
            }
        })
    }

    #utf16leBytes(str) {
        const bytes = new Uint8Array(str.length * 2);
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            bytes[i * 2] = code & 0xff;
            bytes[i * 2 + 1] = code >> 8;
        }
        return bytes;
    }

    async #decrypt(data) {
        const key = await crypto.subtle.importKey(
            "raw",
            this.#ENCRYPTION_KEY,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
        );

        return crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: this.#ENCRYPTION_KEY
            },
            key,
            data
        );
    }

    #readMetadata(reader, expectedType) {
        const num1 = reader.readUInt64();

        if ((num1 & 0xFFFFFFFFFFFFFFn) !== 27981915666277746n) {
            throw new Error("Expected correct file format.");
        }

        const typeByte = Number((num1 >> 56n) & 0xFFn);
        if (!Object.values(this.#FileType).includes(typeByte) || typeByte === this.#FileType.None) {
            throw new Error("Found invalid file type.");
        }

        const result = {
            type: typeByte,
            typeName: this.#FileTypeNames[typeByte],
            revision: reader.readUInt32(),
            isFavorite: (reader.readUInt64() & 1n) === 1n
        };

        if (result.type != expectedType) {
            throw new Error("Expected type " + this.#FileTypeNames[expectedType] + " but found " + result.typeName);
        } else {
            return result;
        }
    }
}