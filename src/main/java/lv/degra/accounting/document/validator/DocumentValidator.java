//package lv.degra.accounting.document.validator;
//
//import lv.degra.accounting.document.Dto.DocumentDto;
//import org.springframework.stereotype.Component;
//import org.springframework.validation.Errors;
//import org.springframework.validation.Validator;
//
//import java.util.Date;
//
//@Component
//public class DocumentValidator  implements Validator {
//
//    @Override
//    public boolean supports(Class<?> clazz) {
//        return DocumentDto.class.isAssignableFrom(clazz);
//    }
//
//    @Override
//    public void validate(Object target, Errors errors) {
//
//        if (errors.getErrorCount() == 0) {
//
//            DocumentDto param = (DocumentDto) target;
//            Date now = new Date();
//            if (param.getCreatedDatetime() == null) {
//
//                errors.reject("100",
//
//                        "Create Date Time can't be null");
//
//            } else if (now.before(param.getCreatedDatetime())) {
//
//                errors.reject("101",
//
//                        "Create Date Time can't be after current date time");
//
//            }
//
//        }
//
//    }
//
//}