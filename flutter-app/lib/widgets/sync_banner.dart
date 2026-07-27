import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/offline_provider.dart';
import '../theme/app_theme.dart';

class SyncBanner extends StatelessWidget {
  const SyncBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<OfflineProvider>(
      builder: (context, offline, _) {
        if (offline.isOnline && offline.pendingCount == 0) {
          return const SizedBox.shrink();
        }
        final isWarning = offline.isOnline && offline.pendingCount > 0;
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          color: isWarning ? const Color(0xFFFEF3C7) : const Color(0xFFFEE2E2),
          child: Row(
            children: [
              if (isWarning) ...[
                const Text(
                  'إرسال الآن',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    decoration: TextDecoration.underline,
                  ),
                ),
                const SizedBox(width: 8),
              ],
              Expanded(
                child: Text(
                  isWarning
                      ? '${offline.pendingCount} بطاقة بانتظار الإرسال'
                      : 'لا يوجد اتصال — سيتم الحفظ محلياً',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    color: isWarning
                        ? const Color(0xFF92400E)
                        : const Color(0xFF7F1D1D),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                isWarning ? Icons.cloud_upload_outlined : Icons.cloud_off,
                size: 16,
                color: isWarning
                    ? const Color(0xFF92400E)
                    : const Color(0xFF7F1D1D),
              ),
            ],
          ),
        );
      },
    );
  }
}
