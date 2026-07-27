import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/tasks_provider.dart';
import '../providers/offline_provider.dart';
import '../models/task.dart';
import '../theme/app_theme.dart';
import '../widgets/app_header.dart';
import '../widgets/dynamic_form_field.dart';

class FormScreen extends StatefulWidget {
  final String taskId;
  const FormScreen({super.key, required this.taskId});

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  final Map<String, dynamic> _formData = {};
  final Map<String, String> _errors = {};
  bool _submitting = false;

  bool _validate(List fields) {
    final newErrors = <String, String>{};
    for (final field in fields) {
      final value = _formData[field.id];
      if (field.required) {
        if (value == null ||
            (value is String && value.trim().isEmpty) ||
            (value is List && value.isEmpty)) {
          newErrors[field.id] = 'حقل "${field.label}" مطلوب';
        }
      }
      if (field.digits != null &&
          value is String &&
          value.isNotEmpty &&
          value.length != field.digits) {
        newErrors[field.id] = 'يجب أن يكون ${field.digits} أرقام';
      }
    }
    setState(() => _errors.clear()..addAll(newErrors));
    return newErrors.isEmpty;
  }

  Future<void> _submit() async {
    final tasks = context.read<TasksProvider>();
    final offline = context.read<OfflineProvider>();
    final task = tasks.getTask(widget.taskId);
    final schema = task != null ? tasks.getFormSchema(task.formSchemaId) : null;

    if (schema == null) return;
    if (!_validate(schema.fields)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى تصحيح الحقول المحددة'),
          backgroundColor: AppColors.danger,
        ),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await Future.delayed(const Duration(milliseconds: 800)); // Simulate API

      if (offline.isOnline) {
        // TODO: POST /api/forms/submit with _formData
        await tasks.updateTaskStatus(widget.taskId, TaskStatus.closed);
        if (!mounted) return;
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            title: const Text('تم الإرسال', textDirection: TextDirection.rtl),
            content: const Text('تم إرسال البيانات بنجاح',
                textDirection: TextDirection.rtl),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('موافق'),
              )
            ],
          ),
        );
      } else {
        await offline.addToQueue('form_submit', {
          'taskId': widget.taskId,
          'formSchemaId': schema.id,
          'data': _formData,
          'submittedAt': DateTime.now().toIso8601String(),
        });
        await tasks.updateTaskStatus(widget.taskId, TaskStatus.pendingSync);
        if (!mounted) return;
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            title: const Text('تم الحفظ', textDirection: TextDirection.rtl),
            content: const Text(
                'لا يوجد اتصال. سيتم الإرسال تلقائياً عند توفر الاتصال.',
                textDirection: TextDirection.rtl),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pop(context);
                  Navigator.pop(context);
                },
                child: const Text('موافق'),
              )
            ],
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('حدث خطأ أثناء الإرسال. حاول مجدداً.'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TasksProvider>();
    final offline = context.watch<OfflineProvider>();
    final task = tasks.getTask(widget.taskId);
    final schema = task != null ? tasks.getFormSchema(task.formSchemaId) : null;

    if (task == null || schema == null) {
      return Scaffold(
        appBar: const AppHeader(title: 'النموذج', showBack: true),
        body: const Center(child: Text('النموذج غير موجود')),
      );
    }

    return Scaffold(
      appBar: AppHeader(title: schema.name, showBack: true),
      body: Column(
        children: [
          // Banner
          Container(
            color: AppColors.accent,
            padding: const EdgeInsets.symmetric(vertical: 10),
            width: double.infinity,
            child: Text(
              schema.name,
              textAlign: TextAlign.center,
              style: const TextStyle(
                  fontSize: 15, fontWeight: FontWeight.w700),
            ),
          ),

          // Offline indicator
          if (!offline.isOnline)
            Container(
              color: const Color(0xFFFEE2E2),
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 8),
              width: double.infinity,
              child: const Text(
                'وضع بدون اتصال — سيتم الحفظ محلياً',
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.danger, fontSize: 13),
              ),
            ),

          // Task info bar
          Container(
            margin: const EdgeInsets.symmetric(
                horizontal: 14, vertical: 10),
            padding: const EdgeInsets.symmetric(
                horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.card,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(task.customerName,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 13),
                    textDirection: TextDirection.rtl),
                Text('رقم الخدمة: ${task.serviceNumber}',
                    style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 14,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),

          // Form fields
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  ...schema.fields.map((field) => DynamicFormFieldWidget(
                        field: field,
                        value: _formData[field.id],
                        error: _errors[field.id],
                        onChanged: (v) {
                          setState(() {
                            _formData[field.id] = v;
                            _errors.remove(field.id);
                          });
                        },
                      )),
                  const SizedBox(height: 8),

                  // Submit
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _submit,
                      child: _submitting
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                  color: Colors.white, strokeWidth: 2),
                            )
                          : Text(offline.isOnline
                              ? 'إرسال البيانات'
                              : 'حفظ محلياً'),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Cancel
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton(
                      onPressed:
                          _submitting ? null : () => Navigator.pop(context),
                      child: const Text('إلغاء'),
                    ),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
