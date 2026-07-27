enum FormFieldType { number, text, date, dropdown, phone, textarea, image }

extension FormFieldTypeX on FormFieldType {
  static FormFieldType fromString(String s) {
    switch (s) {
      case 'number':
        return FormFieldType.number;
      case 'date':
        return FormFieldType.date;
      case 'dropdown':
        return FormFieldType.dropdown;
      case 'phone':
        return FormFieldType.phone;
      case 'textarea':
        return FormFieldType.textarea;
      case 'image':
        return FormFieldType.image;
      default:
        return FormFieldType.text;
    }
  }
}

class DropdownOption {
  final String label;
  final String value;
  const DropdownOption({required this.label, required this.value});
}

class FormFieldSchema {
  final String id;
  final String label;
  final FormFieldType type;
  final bool required;
  final String? placeholder;
  final int? digits;
  final int? maxLength;
  final List<DropdownOption>? dropdownOptions;
  final bool multiple;

  const FormFieldSchema({
    required this.id,
    required this.label,
    required this.type,
    required this.required,
    this.placeholder,
    this.digits,
    this.maxLength,
    this.dropdownOptions,
    this.multiple = false,
  });
}

class FormSchema {
  final String id;
  final String name;
  final List<FormFieldSchema> fields;

  const FormSchema({
    required this.id,
    required this.name,
    required this.fields,
  });
}
