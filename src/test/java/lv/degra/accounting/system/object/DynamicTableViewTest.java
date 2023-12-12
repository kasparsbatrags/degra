package lv.degra.accounting.system.object;


import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.testfx.framework.junit5.ApplicationTest;

import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;

import lv.degra.accounting.system.exception.IllegalDataArgumentException;
import lv.degra.accounting.system.object.DynamicTableView;


class DynamicTableViewTest extends ApplicationTest {
	private DynamicTableView tableView;

	@Override
	public void start(Stage stage) {
		tableView = new DynamicTableView();
		stage.setScene(new Scene(tableView));
		stage.show();
	}

	@Test
	void testSetDataWithEmptyList() {
		DynamicTableView<Object> tableView = new DynamicTableView<>();
		List<Object> data = Collections.emptyList();

		assertThrows(IllegalStateException.class, () -> tableView.setData(data));
	}
//	@Test
//	public void testSetEmptyData() {
//		// Arrange
//		Creator<Object> mockCreator = mock(Creator.class);
//		Updater<Object> mockUpdater = mock(Updater.class);
//		Deleter<Object> mockDeleter = mock(Deleter.class);
//		tableView.setCreator(mockCreator);
//		tableView.setUpdater(mockUpdater);
//		tableView.setDeleter(mockDeleter);
//		ObservableList<Object> data = FXCollections.observableArrayList();
//
//		// Act
//		tableView.setData(data);
//
//		// Assert
//		// Here you would add assertions to verify the state of tableView
//		// For example, you might verify that the correct columns were added
//	}
}