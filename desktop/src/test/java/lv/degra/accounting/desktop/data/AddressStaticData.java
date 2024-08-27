package lv.degra.accounting.desktop.data;

import lv.degra.accounting.core.address.model.Address;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class AddressStaticData {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");

    public static final Address ADDRESS1 = createAddress(1, 118031480, 108, "1", 101108224, 108, "45", "37", null, LocalDate.parse("2008-10-20", DATE_FORMAT), null, LocalDate.parse("2009-06-30T03:00:00.000", DATETIME_FORMAT), "Nogāzes iela 2B - 45, Ogre, Ogres nov., LV-5001", 4, Instant.parse("2024-03-20T05:44:12.060Z"), Instant.parse("2024-03-20T05:44:12.060Z"));
    public static final Address ADDRESS2 = createAddress(2, 101834612, 108, "1", 100304293, 107, "1A", "0001A", "LV-1063", LocalDate.parse("2001-01-25", DATE_FORMAT), null, LocalDate.parse("2003-01-10T02:00:00.000", DATETIME_FORMAT), "Ķengaraga iela 1A, Rīga, LV-1063", 4, Instant.parse("2024-03-20T05:44:12.067Z"), Instant.parse("2024-03-20T05:44:12.067Z"));
    public static final Address ADDRESS3 = createAddress(3, 101818622, 108, "1", 100301335, 107, "15", "13", "LV-1048", LocalDate.parse("2001-01-25", DATE_FORMAT), null, LocalDate.parse("2015-07-23T03:00:00.000", DATETIME_FORMAT), "Balasta dambis 15, Rīga, LV-1048", 4, Instant.parse("2024-03-20T05:44:12.073Z"), Instant.parse("2024-03-20T05:44:12.073Z"));
    public static final Address ADDRESS4 = createAddress(4, 105640841, 108, "1", 100457961, 107, "1", "1", "LV-1076", LocalDate.parse("2008-02-22", DATE_FORMAT), null, LocalDate.parse("2009-07-15T03:00:00.000", DATETIME_FORMAT), "Meistaru iela 1, Valdlauči, Ķekavas pag., Ķekavas nov., LV-1076", 4, Instant.parse("2024-03-20T05:44:12.078Z"), Instant.parse("2024-03-20T05:44:12.078Z"));
    public static final Address ADDRESS5 = createAddress(5, 104602888, 108, "1", 100310578, 107, "2A", "0002A", "LV-1010", LocalDate.parse("2004-03-01", DATE_FORMAT), null, LocalDate.parse("2014-08-05T03:00:00.000", DATETIME_FORMAT), "Republikas laukums 2A, Rīga, LV-1010", 4, Instant.parse("2024-03-20T05:44:12.085Z"), Instant.parse("2024-03-20T05:44:12.085Z"));
    public static final Address ADDRESS6 = createAddress(6, 105595873, 108, "1", 100014707, 105, "Ceļinieki", "Ceļinieki", "LV-3621", LocalDate.parse("2007-12-28", DATE_FORMAT), null, LocalDate.parse("2009-06-30T03:00:00.000", DATETIME_FORMAT), "\"Ceļinieki\", Tārgales pag., Ventspils nov., LV-3621", 4, Instant.parse("2024-03-20T05:44:12.091Z"), Instant.parse("2024-03-20T05:44:12.091Z"));
    public static final Address ADDRESS7 = createAddress(7, 105491641, 108, "1", 100311596, 107, "12", "10", "LV-1013", LocalDate.parse("2007-08-01", DATE_FORMAT), null, LocalDate.parse("2021-03-10T02:00:00.000", DATETIME_FORMAT), "Skanstes iela 12, Rīga, LV-1013", 4, Instant.parse("2024-03-20T05:44:12.096Z"), Instant.parse("2024-03-20T05:44:12.096Z"));

    private static Address createAddress(int id, int code, int type, String status, int parentCode, int parentType, String name, String sortByValue, String zip, LocalDate dateFrom, LocalDate dateTo, LocalDate updateDatePublic, String fullName, int territorialUnitCode, Instant createdAt, Instant lastModifiedAt) {
        Address address = new Address();
        address.setId(id);
        address.setCode(code);
        address.setType(type);
        address.setStatus(status);
        address.setParentCode(parentCode);
        address.setParentType(parentType);
        address.setName(name);
        address.setSortByValue(sortByValue);
        address.setZip(zip);
        address.setDateFrom(dateFrom);
        address.setDateTo(dateTo);
        address.setUpdateDatePublic(updateDatePublic);
        address.setFullName(fullName);
        address.setTerritorialUnitCode(territorialUnitCode);
        address.setCreatedAt(createdAt);
        address.setLastModifiedAt(lastModifiedAt);
        return address;
    }
}
