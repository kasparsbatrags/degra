package lv.degra.accounting.system.object;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testfx.api.FxToolkit;
import org.testfx.framework.junit5.ApplicationTest;

import javafx.scene.Scene;
import javafx.stage.Stage;

class DynamicTableViewTest extends ApplicationTest {

	private DynamicTableView<Object> tableView;

	@Override
	public void start(Stage stage) {
		tableView = new DynamicTableView<>();
		stage.setScene(new Scene(tableView));
		stage.show();
	}

	@BeforeEach
	public void setUp() {
		tableView = new DynamicTableView<>();
	}

	@BeforeEach
	public void setUpClass() throws Exception {
		FxToolkit.registerPrimaryStage();
	}

	@AfterEach
	public void tearDown() throws Exception {
		FxToolkit.cleanupStages();
	}

	@Test
	void testSetDataWithEmptyListThrowsExceptionWhenTypeIsNotSet() {
		List<Object> data = Collections.emptyList();
		assertThrows(IllegalStateException.class, () -> tableView.setData(data));
	}

}
