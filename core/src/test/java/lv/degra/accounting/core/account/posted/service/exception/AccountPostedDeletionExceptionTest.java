package lv.degra.accounting.core.account.posted.service.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class AccountPostedDeletionExceptionTest {

	@Test
	void testExceptionWithMessageOnly() {

		String message = "Deletion not allowed for posted account";


		AccountPostedDeletionException exception = new AccountPostedDeletionException(message);


		assertEquals(message, exception.getMessage(), "Exception message should match the input message");


		assertNull(exception.getCause(), "Cause should be null when not provided");
	}

	@Test
	void testExceptionWithMessageAndCause() {

		String message = "Deletion not allowed for posted account";
		Throwable cause = new IllegalArgumentException("Invalid account state");


		AccountPostedDeletionException exception = new AccountPostedDeletionException(message, cause);


		assertEquals(message, exception.getMessage(), "Exception message should match the input message");


		assertEquals(cause, exception.getCause(), "Cause should match the provided throwable");
	}

	@Test
	void testExceptionWithoutMessageAndCause() {

		AccountPostedDeletionException exception = new AccountPostedDeletionException(null, null);


		assertNull(exception.getMessage(), "Message should be null when not provided");
		assertNull(exception.getCause(), "Cause should be null when not provided");
	}
}
