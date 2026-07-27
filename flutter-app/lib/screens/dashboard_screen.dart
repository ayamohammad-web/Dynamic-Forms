import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/tasks_provider.dart';
import '../providers/offline_provider.dart';
import '../models/task.dart';
import '../theme/app_theme.dart';
import '../widgets/app_header.dart';
import '../widgets/task_card.dart';
import '../widgets/sync_banner.dart';
import 'task_detail_screen.dart';
import 'search_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  TaskStatus? _filter; // null = all

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final tasks = context.watch<TasksProvider>();
    final offline = context.watch<OfflineProvider>();

    final filtered = _filter == null
        ? tasks.tasks
        : tasks.tasks.where((t) => t.status == _filter).toList();

    final openCount = tasks.tasks
        .where((t) =>
            t.status == TaskStatus.open || t.status == TaskStatus.inProgress)
        .length;

    return Scaffold(
      appBar: AppHeader(
        title: 'الرئيسية',
        showMenu: true,
        showSearch: true,
        pendingSync: offline.pendingCount,
        onSearchPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SearchScreen()),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () => tasks.refresh(),
        color: AppColors.primary,
        child: Column(
          children: [
            const SyncBanner(),

            // Yellow banner
            Container(
              color: AppColors.accent,
              padding: const EdgeInsets.symmetric(vertical: 10),
              width: double.infinity,
              child: const Text(
                'قائمة المهام',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1A1A2E),
                ),
              ),
            ),

            // User info
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _InfoLine(label: 'مرحبا', value: auth.user?.name ?? '—'),
                  const SizedBox(height: 4),
                  _InfoLine(label: 'الفرقة', value: auth.user?.team ?? '—'),
                ],
              ),
            ),

            // Filter chips
            SizedBox(
              height: 40,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding:
                    const EdgeInsets.symmetric(horizontal: 14),
                children: [
                  _FilterChip(label: 'الكل', selected: _filter == null,
                      onTap: () => setState(() => _filter = null)),
                  _FilterChip(label: 'مفتوحة', selected: _filter == TaskStatus.open,
                      onTap: () => setState(() => _filter = TaskStatus.open)),
                  _FilterChip(label: 'قيد التنفيذ', selected: _filter == TaskStatus.inProgress,
                      onTap: () => setState(() => _filter = TaskStatus.inProgress)),
                  _FilterChip(label: 'انتظار الإرسال', selected: _filter == TaskStatus.pendingSync,
                      onTap: () => setState(() => _filter = TaskStatus.pendingSync)),
                  _FilterChip(label: 'مغلقة', selected: _filter == TaskStatus.closed,
                      onTap: () => setState(() => _filter = TaskStatus.closed)),
                ],
              ),
            ),
            const SizedBox(height: 4),

            // Count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('${filtered.length} مهمة',
                      style: const TextStyle(
                          color: AppColors.textMuted, fontSize: 13)),
                  Row(
                    children: [
                      const Icon(Icons.error_outline,
                          size: 14, color: AppColors.primary),
                      const SizedBox(width: 4),
                      Text('عدد البطاقات المفتوحة $openCount',
                          style: const TextStyle(
                              color: AppColors.primary,
                              fontSize: 13,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),

            // Task list
            Expanded(
              child: tasks.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: AppColors.primary))
                  : filtered.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.assignment_outlined,
                                  size: 48, color: AppColors.textMuted),
                              SizedBox(height: 12),
                              Text('لا توجد مهام',
                                  style: TextStyle(
                                      color: AppColors.textMuted,
                                      fontSize: 16)),
                            ],
                          ),
                        )
                      : ListView.builder(
                          itemCount: filtered.length,
                          itemBuilder: (context, i) => TaskCard(
                            task: filtered[i],
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => TaskDetailScreen(
                                    taskId: filtered[i].id),
                              ),
                            ),
                          ),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  final String label;
  final String value;
  const _InfoLine({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(label,
            style: const TextStyle(
                color: AppColors.textMuted, fontSize: 13)),
        const SizedBox(width: 12),
        Text(value,
            style: const TextStyle(
                color: AppColors.text,
                fontSize: 13,
                fontWeight: FontWeight.w600),
            textDirection: TextDirection.rtl),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FilterChip(
      {required this.label,
      required this.selected,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(left: 8),
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : AppColors.card,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : AppColors.textMuted,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
