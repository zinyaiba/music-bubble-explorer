/**
 * データ共有設定
 */

import { DataSharingMethod } from '@/services/sharedDataService'

/**
 * 共有設定
 * GitHub Issues方式を使用する場合は、以下を設定してください
 */
export const SHARING_CONFIG = {
  // 共有方式（GitHub Issues方式を有効化）
  method: DataSharingMethod.GITHUB_ISSUES,
  
  // GitHub Issues方式を使用する場合の設定
  github: {
    // リポジトリ名（例: "username/music-bubble-explorer"）
    repo: process.env.REACT_APP_GITHUB_REPO || '',
    
    // GitHub Personal Access Token（Issues作成権限が必要）
    token: process.env.REACT_APP_GITHUB_TOKEN || '',
    
    // Issue作成時のラベル
    labels: ['song-registration', 'community-contribution']
  }
}

/**
 * GitHub Issues方式を有効にする方法:
 * 
 * 1. GitHubリポジトリを作成
 * 2. Personal Access Tokenを作成（repo権限が必要）
 * 3. 環境変数を設定:
 *    - REACT_APP_GITHUB_REPO=username/repository-name
 *    - REACT_APP_GITHUB_TOKEN=your_personal_access_token
 * 4. SHARING_CONFIG.methodをDataSharingMethod.GITHUB_ISSUESに変更
 */

/**
 * 環境変数の設定例（.env.local ファイル）:
 * 
 * REACT_APP_GITHUB_REPO=your-username/music-bubble-explorer
 * REACT_APP_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */

/**
 * GitHub Personal Access Tokenの作成方法:
 * 
 * 1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
 * 2. "Generate new token (classic)" をクリック
 * 3. 以下の権限を選択:
 *    - repo (Full control of private repositories)
 *    - public_repo (Access public repositories)
 * 4. トークンをコピーして環境変数に設定
 */

/**
 * セキュリティ注意事項:
 * 
 * - Personal Access Tokenは秘密情報です
 * - .env.local ファイルは .gitignore に含めてください
 * - 本番環境では環境変数として設定してください
 * - トークンが漏洩した場合は即座に無効化してください
 */