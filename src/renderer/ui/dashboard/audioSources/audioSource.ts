import { Source, SourceType } from "../../../obs/protocol";

export interface AudioSource extends Source {
    sourceType: SourceType & { caps: { isAudio: true } };
}
