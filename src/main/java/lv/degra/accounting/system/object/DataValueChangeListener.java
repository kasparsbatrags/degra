package lv.degra.accounting.system.object;

import javafx.beans.property.BooleanProperty;

public interface DataValueChangeListener {
    BooleanProperty getValueChanged();
    void setValueChanged(boolean dataSaved);
    boolean isValueChanged();
}
