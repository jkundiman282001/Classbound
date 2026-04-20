<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $issuedTokensCount = $user->tokens()->count();

        return response()->json([
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'member_since' => $user->created_at?->toDateString(),
                'last_updated_at' => $user->updated_at?->toIso8601String(),
            ],
            'progress' => [
                'classes_started' => 0,
                'classes_completed' => 0,
                'lessons_completed' => 0,
                'quizzes_passed' => 0,
                'final_exams_passed' => 0,
            ],
            'rewards' => [
                'badges_unlocked' => 0,
                'certificates_earned' => 0,
                'cosmetics_owned' => 0,
                'downloadable_assets_unlocked' => 0,
            ],
            'account' => [
                'active_api_tokens' => $issuedTokensCount,
                'current_time' => Carbon::now()->toIso8601String(),
            ],
            'build_status' => [
                [
                    'key' => 'classes',
                    'title' => 'Class catalog',
                    'description' => 'Expose the first real class list and module structure from the backend.',
                    'status' => 'next_build_target',
                ],
                [
                    'key' => 'progression',
                    'title' => 'Progression tracking',
                    'description' => 'Persist lessons, quiz attempts, and completion state for each class.',
                    'status' => 'domain_planned',
                ],
                [
                    'key' => 'rewards',
                    'title' => 'Rewards inventory',
                    'description' => 'Attach badges, certificates, and cosmetics to verified class completion.',
                    'status' => 'pending_api',
                ],
            ],
        ]);
    }
}
