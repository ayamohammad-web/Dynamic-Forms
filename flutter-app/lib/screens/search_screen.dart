import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/tasks_provider.dart';
import '../models/task.dart';
import '../theme/app_theme.dart';
import '../widgets/app_header.dart';
import '../widgets/task_card.dart';
import 'task_detail_screen.dart';

enum SearchType { serviceNumber, meterNumber, customerName }

extension SearchTypeX on SearchType {
  String get label {
    switch (this) {
      case SearchType.serviceNumber:
        return 'رقم الخدمة';
      case SearchType.meterNumber:
        return 'رقم العداد';
      case SearchType.customerName:
        return 'الاسم';
    }
  }
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  SearchType _searchType = SearchType.serviceNumber;
  String _query = '';
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  List<Task> _search(List<Task> all) {
    if (_query.trim().isEmpty) return [];
    final q = _query.trim().toLowerCase();
    return all.where((t) {
      switch (_searchType) {
        case SearchType.serviceNumber:
          return t.serviceNumber.contains(q);
        case SearchType.meterNumber:
          return (t.meterNumber ?? '').contains(q);
        case SearchType.customerName:
          return t.customerName.contains(q);
      }
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final tasks = context.watch<TasksProvider>();
    final results = _search(tasks.tasks);

    return Scaffold(
      appBar: AppHeader(title: 'بحث عن خدمة', showBack: true),
      body: Column(
        children: [
          // Banner
          Container(
            color: AppColors.accent,
            padding: const EdgeInsets.symmetric(vertical: 10),
            width: double.infinity,
            child: const Text(
              'بحث عن خدمة',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
            ),
          ),

          // Search type radio
          Container(
            color: AppColors.card,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: SearchType.values
                  .map((type) => GestureDetector(
                        onTap: () => setState(() => _searchType = type),
                        child: Row(
                          children: [
                            Text(type.label,
                                style: TextStyle(
                                    color: _searchType == type
                                        ? AppColors.primary
                                        : AppColors.textMuted,
                                    fontSize: 14,
                                    fontWeight: _searchType == type
                                        ? FontWeight.w600
                                        : FontWeight.normal)),
                            const SizedBox(width: 4),
                            Icon(
                              _searchType == type
                                  ? Icons.radio_button_on
                                  : Icons.radio_button_off,
                              color: _searchType == type
                                  ? AppColors.primary
                                  : AppColors.textMuted,
                              size: 20,
                            ),
                            const SizedBox(width: 16),
                          ],
                        ),
                      ))
                  .toList(),
            ),
          ),

          // Search input
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            child: Directionality(
              textDirection: TextDirection.rtl,
              child: TextField(
                controller: _ctrl,
                textAlign: TextAlign.right,
                keyboardType: _searchType != SearchType.customerName
                    ? TextInputType.number
                    : TextInputType.text,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: _searchType.label,
                  suffixIcon: _query.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.close, color: AppColors.textMuted),
                          onPressed: () {
                            _ctrl.clear();
                            setState(() => _query = '');
                          })
                      : null,
                ),
                onChanged: (v) => setState(() => _query = v),
              ),
            ),
          ),

          // Buttons
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('رجوع'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => setState(() {}),
                    child: const Text('بحث'),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Results
          if (_query.trim().isNotEmpty) ...[
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Align(
                alignment: Alignment.centerRight,
                child: Text('${results.length} نتيجة',
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 13)),
              ),
            ),
            Expanded(
              child: results.isEmpty
                  ? const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.search_off,
                              size: 48, color: AppColors.textMuted),
                          SizedBox(height: 10),
                          Text('لا توجد نتائج',
                              style: TextStyle(
                                  color: AppColors.textMuted, fontSize: 15)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      itemCount: results.length,
                      itemBuilder: (context, i) => TaskCard(
                        task: results[i],
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) =>
                                TaskDetailScreen(taskId: results[i].id),
                          ),
                        ),
                      ),
                    ),
            ),
          ] else
            const Expanded(child: SizedBox.shrink()),
        ],
      ),
    );
  }
}
