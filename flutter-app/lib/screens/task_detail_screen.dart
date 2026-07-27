import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/tasks_provider.dart';
import '../providers/offline_provider.dart';
import '../models/task.dart';
import '../theme/app_theme.dart';
import '../widgets/app_header.dart';
import '../widgets/status_badge.dart';
import 'form_screen.dart';

class TaskDetailScreen extends StatelessWidget {
  final String taskId;
  const TaskDetailScreen({super.key, required this.taskId});

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TasksProvider>();
    final offline = context.watch<OfflineProvider>();
    final task = tasks.getTask(taskId);
    final schema = task != null ? tasks.getFormSchema(task.formSchemaId) : null;

    if (task == null) {
      return Scaffold(
        appBar: const AppHeader(title: 'تفاصيل العطل', showBack: true),
        body: const Center(child: Text('المهمة غير موجودة')),
      );
    }

    String formatDate(DateTime dt) =>
        DateFormat('HH:mm yyyy/MM/dd').format(dt);

    Future<void> handleStartTask() async {
      await tasks.updateTaskStatus(task.id, TaskStatus.inProgress);
      if (context.mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => FormScreen(taskId: task.id),
          ),
        );
      }
    }

    Future<void> handleClose() async {
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('إغلاق المهمة', textDirection: TextDirection.rtl),
          content: const Text('هل تريد إغلاق هذه المهمة؟',
              textDirection: TextDirection.rtl),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('إلغاء')),
            ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('إغلاق')),
          ],
        ),
      );
      if (confirmed == true) {
        if (!offline.isOnline) {
          await offline.addToQueue(
              'task_close', {'taskId': task.id});
          await tasks.updateTaskStatus(task.id, TaskStatus.pendingSync);
        } else {
          await tasks.updateTaskStatus(task.id, TaskStatus.closed);
        }
        if (context.mounted) Navigator.pop(context);
      }
    }

    return Scaffold(
      appBar: const AppHeader(title: 'تفاصيل العطل', showBack: true),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Timestamp banner
            Container(
              color: AppColors.primary,
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 10),
              width: double.infinity,
              child: Text(
                formatDate(task.entryDate),
                textAlign: TextAlign.right,
                style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600),
              ),
            ),

            // Details banner
            Container(
              color: const Color(0xFFF0F4FF),
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 10),
              child: Row(
                children: [
                  OutlinedButton(
                    onPressed: () {},
                    style: OutlinedButton.styleFrom(
                        minimumSize: Size.zero,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                    child: const Text('تبليغات سابقة',
                        style: TextStyle(fontSize: 12)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      task.details,
                      textAlign: TextAlign.right,
                      textDirection: TextDirection.rtl,
                      style: const TextStyle(
                          color: AppColors.primary, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

            // Details card
            Container(
              margin: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 12),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        StatusBadge(status: task.status),
                        const Text('تفاصيل العطل',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  const Divider(height: 1),
                  _DetailRow('رقم الخدمة', task.serviceNumber),
                  _DetailRow('نوع العطل', task.faultType),
                  _DetailRow('فئة العطل', task.faultCategory),
                  _DetailRow('اهمية العطل', task.faultImportance),
                  _DetailRow('حالة العطل', task.status.label),
                  _DetailRow('رقم الهاتف', task.phone, highlight: true),
                  _DetailRow('العنوان', task.address),
                  _DetailRow('نوع العقار', task.propertyType),
                  _DetailRow('اسم المشتكي', task.customerName, highlight: true),
                  _DetailRow('وقت التبليغ', formatDate(task.entryDate)),
                  _DetailRow('تفاصيل العطل', task.details),
                ],
              ),
            ),

            // Action buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              child: Column(
                children: [
                  _ActionBtn(
                      label: 'تعديل البطاقة',
                      onPressed: () {}),
                  const SizedBox(height: 8),
                  _ActionBtn(
                    label: schema?.name ?? 'اجراء عداد',
                    color: AppColors.primary,
                    textColor: Colors.white,
                    bold: true,
                    onPressed: handleStartTask,
                  ),
                  const SizedBox(height: 8),
                  _ActionBtn(
                      label: 'تغيير عداد',
                      onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => FormScreen(taskId: task.id)),
                          )),
                  const SizedBox(height: 8),
                  _ActionBtn(
                      label: 'ارسال STS TOKEN',
                      enabled: false,
                      onPressed: () {}),
                  const SizedBox(height: 8),
                  _ActionBtn(
                      label: 'اعادة الاسناد',
                      enabled: false,
                      onPressed: () {}),
                  const SizedBox(height: 8),
                  _ActionBtn(
                    label: 'إغلاق المهمة',
                    color: const Color(0xFFFEE2E2),
                    textColor: AppColors.danger,
                    onPressed: handleClose,
                  ),
                  const SizedBox(height: 8),
                  _ActionBtn(
                    label: 'رجوع',
                    onPressed: () => Navigator.pop(context),
                  ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final bool highlight;
  const _DetailRow(this.label, this.value, {this.highlight = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Flexible(
            child: Text(
              value,
              style: TextStyle(
                color: highlight ? AppColors.danger : AppColors.text,
                fontSize: 13,
              ),
              textDirection: TextDirection.rtl,
            ),
          ),
          const SizedBox(width: 16),
          Text(
            label,
            style: const TextStyle(
              color: AppColors.textMuted,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final Color color;
  final Color textColor;
  final bool bold;
  final bool enabled;

  const _ActionBtn({
    required this.label,
    required this.onPressed,
    this.color = const Color(0xFFF3F4F6),
    this.textColor = AppColors.text,
    this.bold = false,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: TextButton(
        onPressed: enabled ? onPressed : null,
        style: TextButton.styleFrom(
          backgroundColor: enabled ? color : const Color(0xFFE5E7EB),
          foregroundColor: enabled ? textColor : Colors.grey,
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 15,
            fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
            color: enabled ? textColor : Colors.grey,
          ),
        ),
      ),
    );
  }
}
