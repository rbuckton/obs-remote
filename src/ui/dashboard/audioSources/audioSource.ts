import { Source, SourceType } from "../../../obs/common/protocol";

export interface AudioSource extends Source {
    sourceType: SourceType & { caps: { isAudio: true } };
}
