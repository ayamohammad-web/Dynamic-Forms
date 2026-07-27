import 'package:flutter/material.dart';
import '../models/task.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final TaskStatus status;
  const StatusBadge({super.key, required this.status});

  Color get bgColor {
    switch (status) {
      case TaskStatus.open:
        return AppColors.statusOpenBg;
      case TaskStatus.inProgress:
        return AppColors.statusInProgressBg;
      case TaskStatus.closed:
        return AppColors.statusClosedBg;
      case TaskStatus.pendingSync:
        return AppColors.statusPendingSyncBg;
    }
  }

  Color get textColor {
    switch (status) {
      case TaskStatus.open:
        return AppColors.statusOpen;
      case TaskStatus.inProgress:
        return AppColors.statusInProgress;
      case TaskStatus.closed:
        return AppColors.statusClosed;
      case TaskStatus.pendingSync:
        return AppColors.statusPendingSync;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          color: textColor,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
