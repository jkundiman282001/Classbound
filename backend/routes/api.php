<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => [
    'status' => 'ok',
    'service' => 'classbound-backend',
    'version' => 'v1',
    'timestamp' => Carbon::now()->toIso8601String(),
]);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'me']);
