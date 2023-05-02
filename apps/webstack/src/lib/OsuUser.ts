export interface OsuUser {
    avatar_url: string
    country_code: string
    default_group: string
    id: number
    is_active: boolean
    is_bot: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean
    last_visit: string
    pm_friends_only: boolean
    profile_colour?: unknown
    username: string
    cover_url: string
    discord?: string
    has_supported: boolean
    interests: string
    join_date: string
    kudosu: Kudosu
    location?: unknown
    max_blocks: number
    max_friends: number
    occupation: string
    playmode: string
    playstyle: string[]
    post_count: number
    profile_order: string[]
    title?: unknown
    title_url?: unknown
    twitter?: unknown
    website?: unknown
    country: Country
    cover: Cover
    account_history?: unknown[]
    active_tournament_banner?: unknown
    badges?: unknown[]
    beatmap_playcounts_count: number
    comments_count: number
    favourite_beatmapset_count: number
    follower_count: number
    graveyard_beatmapset_count: number
    groups?: unknown[]
    guest_beatmapset_count: number
    loved_beatmapset_count: number
    mapping_follower_count: number
    monthly_playcounts: MonthlyPlaycount[]
    nominated_beatmapset_count: number
    page: Page
    pending_beatmapset_count: number
    previous_usernames?: unknown[]
    rank_highest?: unknown
    ranked_beatmapset_count: number
    replays_watched_counts: ReplaysWatchedCount[]
    scores_best_count: number
    scores_first_count: number
    scores_pinned_count: number
    scores_recent_count: number
    statistics: Statistics
    support_level: number
    user_achievements: UserAchievement[]
    rank_history?: unknown
    rankHistory?: unknown
    ranked_and_approved_beatmapset_count: number
    unranked_beatmapset_count: number
  }
  
  export interface Kudosu {
    total: number
    available: number
  }
  
  export interface Country {
    code: string
    name: string
  }
  
  export interface Cover {
    custom_url?: unknown
    url: string
    id: string
  }
  
  export interface MonthlyPlaycount {
    start_date: string
    count: number
  }
  
  export interface Page {
    html: string
    raw: string
  }
  
  export interface ReplaysWatchedCount {
    start_date: string
    count: number
  }
  
  export interface Statistics {
    count_100: number
    count_300: number
    count_50: number
    count_miss: number
    level: Level
    global_rank?: unknown
    global_rank_exp?: unknown
    pp: number
    pp_exp: number
    ranked_score: number
    hit_accuracy: number
    play_count: number
    play_time: number
    total_score: number
    total_hits: number
    maximum_combo: number
    replays_watched_by_others: number
    is_ranked: boolean
    grade_counts: GradeCounts
    country_rank?: unknown
    rank: Rank
  }
  
  export interface Level {
    current: number
    progress: number
  }
  
  export interface GradeCounts {
    ss: number
    ssh: number
    s: number
    sh: number
    a: number
  }
  
  export interface Rank {
    country?: unknown
  }
  
  export interface UserAchievement {
    achieved_at: string
    achievement_id: number
  }
  