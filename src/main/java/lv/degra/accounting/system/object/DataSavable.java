package lv.degra.accounting.system.object;

import javafx.beans.property.BooleanProperty;

public interface DataSavable {
    BooleanProperty dataSavedProperty();
    void setDataSaved(boolean dataSaved);
    boolean isDataSaved();
}
