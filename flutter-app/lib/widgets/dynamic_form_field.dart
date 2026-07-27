import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../models/form_schema.dart';
import '../theme/app_theme.dart';

class DynamicFormFieldWidget extends StatefulWidget {
  final FormFieldSchema field;
  final dynamic value;
  final ValueChanged<dynamic> onChanged;
  final String? error;

  const DynamicFormFieldWidget({
    super.key,
    required this.field,
    required this.value,
    required this.onChanged,
    this.error,
  });

  @override
  State<DynamicFormFieldWidget> createState() => _DynamicFormFieldWidgetState();
}

class _DynamicFormFieldWidgetState extends State<DynamicFormFieldWidget> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(
      text: widget.value is String ? widget.value as String : '',
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  InputDecoration _decoration(String? hint) => InputDecoration(
        hintText: hint ?? widget.field.placeholder,
        hintStyle: const TextStyle(color: AppColors.textMuted),
        errorText: widget.error,
        errorStyle: const TextStyle(color: AppColors.danger),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color:
                widget.error != null ? AppColors.danger : AppColors.border,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color:
                widget.error != null ? AppColors.danger : AppColors.border,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      );

  Widget _buildLabel() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          if (widget.field.required)
            const Text(' *',
                style:
                    TextStyle(color: AppColors.danger, fontWeight: FontWeight.bold)),
          Text(
            widget.field.label,
            style: const TextStyle(
              color: AppColors.text,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
            textDirection: TextDirection.rtl,
          ),
        ],
      ),
    );
  }

  Widget _buildTextInput(TextInputType keyboardType) {
    return TextField(
      controller: _controller,
      keyboardType: keyboardType,
      textAlign: TextAlign.right,
      textDirection: TextDirection.rtl,
      maxLength: widget.field.digits ?? widget.field.maxLength,
      decoration: _decoration(null),
      onChanged: widget.onChanged,
    );
  }

  Widget _buildTextarea() {
    return TextField(
      controller: _controller,
      maxLines: 4,
      textAlign: TextAlign.right,
      textDirection: TextDirection.rtl,
      decoration: _decoration(null),
      onChanged: widget.onChanged,
    );
  }

  Widget _buildDatePicker() {
    return GestureDetector(
      onTap: () async {
        final picked = await showDatePicker(
          context: context,
          initialDate: DateTime.now(),
          firstDate: DateTime(2020),
          lastDate: DateTime(2030),
          locale: const Locale('ar', 'SA'),
        );
        if (picked != null) {
          final formatted =
              '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
          setState(() => _controller.text = formatted);
          widget.onChanged(formatted);
        }
      },
      child: AbsorbPointer(
        child: TextField(
          controller: _controller,
          textAlign: TextAlign.right,
          decoration: _decoration('اختر التاريخ').copyWith(
            suffixIcon:
                const Icon(Icons.calendar_today, color: AppColors.primary),
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown() {
    final options = widget.field.dropdownOptions ?? [];
    final selected = options
        .where((o) => o.value == widget.value)
        .map((o) => o.label)
        .firstOrNull;

    return GestureDetector(
      onTap: () {
        showModalBottomSheet(
          context: context,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          builder: (_) => Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(height: 8),
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(
                  widget.field.label,
                  style: const TextStyle(
                      fontSize: 17, fontWeight: FontWeight.w700),
                ),
              ),
              ...options.map((opt) => ListTile(
                    title: Text(opt.label,
                        textAlign: TextAlign.right,
                        textDirection: TextDirection.rtl),
                    leading: widget.value == opt.value
                        ? const Icon(Icons.radio_button_on,
                            color: AppColors.primary)
                        : const Icon(Icons.radio_button_off,
                            color: AppColors.textMuted),
                    onTap: () {
                      widget.onChanged(opt.value);
                      Navigator.pop(context);
                    },
                  )),
              const SizedBox(height: 16),
            ],
          ),
        );
      },
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: widget.error != null ? AppColors.danger : AppColors.border,
          ),
        ),
        child: Row(
          children: [
            const Icon(Icons.keyboard_arrow_down, color: AppColors.textMuted),
            Expanded(
              child: Text(
                selected ?? (widget.field.placeholder ?? 'اختر...'),
                textAlign: TextAlign.right,
                style: TextStyle(
                  color:
                      selected != null ? AppColors.text : AppColors.textMuted,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePicker() {
    final images = widget.value is List ? (widget.value as List).cast<String>() : <String>[];
    final picker = ImagePicker();

    Future<void> pick(bool fromCamera) async {
      try {
        XFile? file;
        if (fromCamera) {
          file = await picker.pickImage(source: ImageSource.camera, imageQuality: 80);
        } else if (widget.field.multiple) {
          final files = await picker.pickMultiImage(imageQuality: 80);
          if (files.isNotEmpty) {
            widget.onChanged([...images, ...files.map((f) => f.path)]);
          }
          return;
        } else {
          file = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
        }
        if (file != null) {
          widget.onChanged(
              widget.field.multiple ? [...images, file.path] : [file.path]);
        }
      } catch (_) {}
    }

    return Column(
      children: [
        if (images.isNotEmpty)
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: images
                .map((path) => Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            File(path),
                            width: 80,
                            height: 80,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: -4,
                          right: -4,
                          child: GestureDetector(
                            onTap: () {
                              widget.onChanged(
                                  images.where((i) => i != path).toList());
                            },
                            child: const CircleAvatar(
                              radius: 10,
                              backgroundColor: AppColors.danger,
                              child: Icon(Icons.close,
                                  size: 12, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    ))
                .toList(),
          ),
        if (images.isNotEmpty) const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => pick(true),
                icon: const Icon(Icons.camera_alt_outlined, size: 18),
                label: const Text('الكاميرا'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  minimumSize: const Size(0, 44),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => pick(false),
                icon: const Icon(Icons.photo_library_outlined, size: 18),
                label: const Text('من المعرض'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  minimumSize: const Size(0, 44),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          _buildLabel(),
          switch (widget.field.type) {
            FormFieldType.number =>
              _buildTextInput(TextInputType.number),
            FormFieldType.phone =>
              _buildTextInput(TextInputType.phone),
            FormFieldType.text => _buildTextInput(TextInputType.text),
            FormFieldType.textarea => _buildTextarea(),
            FormFieldType.date => _buildDatePicker(),
            FormFieldType.dropdown => _buildDropdown(),
            FormFieldType.image => _buildImagePicker(),
          },
          if (widget.error != null && widget.field.type != FormFieldType.dropdown)
            Padding(
              padding: const EdgeInsets.only(top: 4),
              child: Text(
                widget.error!,
                style:
                    const TextStyle(color: AppColors.danger, fontSize: 12),
                textAlign: TextAlign.right,
              ),
            ),
        ],
      ),
    );
  }
}
