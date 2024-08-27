package lv.degra.accounting.core.address.enums;

import lombok.Getter;
import lv.degra.accounting.core.address.model.*;

@Getter
public enum ArZipContentFiles {

    ADDRESS_ZIP_FILE_CONTENT_COUNTIES("AW_NOVADS.CSV", Region.class),
    ADDRESS_ZIP_FILE_CONTENT_CITIES("AW_PILSETA.CSV", City.class),
    ADDRESS_ZIP_FILE_CONTENT_PARISHES("AW_PAGASTS.CSV", CommonData.class),
    ADDRESS_ZIP_FILE_CONTENT_VILLAGES("AW_CIEMS.CSV", CommonData.class),
    ADDRESS_ZIP_FILE_CONTENT_STREETS("AW_IELA.CSV", CommonData.class),
    ADDRESS_ZIP_FILE_CONTENT_BUILDINGS("AW_EKA.CSV", Building.class),
    ADDRESS_ZIP_FILE_CONTENT_FLATS("AW_DZIV.CSV", Flat.class);

    private final String fileName;
    private final Class<? extends AddressData> clasName;

    ArZipContentFiles(String fileName, Class<? extends AddressData> clasName) {
        this.fileName = fileName;
        this.clasName = clasName;
    }

}
