export interface VitalSign {
    id: number;
    user: number;
    date_recorded: string;
    heart_rate?: number;
    systolic_pressure?: number;
    diastolic_pressure?: number;
    respiratory_rate?: number;
    temperature?: number;
    oxygen_saturation?: number;
    blood_glucose?: number;
    weight?: number;
    notes?: string;
    source?: string;
    created_at: string;
}

export interface SleepLog {
    id: number;
    sleep_time: string;
    wake_time: string;
    duration: number;
    quality: number;
    interruptions: number;
    notes?: string;
}

export interface ExerciseLog {
    id: number;
    activity_type: string;
    datetime: string;
    duration: number;
    calories_burned?: number;
    distance?: number;
    intensity: 'low' | 'medium' | 'high';
    heart_rate_avg?: number;
}

export interface HealthGoal {
    id: number;
    goal_type: string;
    target_value: number;
    current_value: number;
    unit: string;
    status: string;
    progress: number;
}

export interface HealthInsight {
    id: number;
    insight_type: 'trend' | 'warning' | 'achievement' | 'recommendation';
    title: string;
    description: string;
    related_metric?: string;
    priority: 'low' | 'medium' | 'high';
    generated_at: string;
}

export interface MedicalDocument {
    id: number;
    file_url: string | null;
    filename: string | null;
    description: string | null;
    document_type: string | null;
    uploaded_at: string;
    appointment?: number | null;
}

export interface MedicalDocumentUploadPayload {
    description?: string;
    document_type?: string;
    appointment?: number;
}
