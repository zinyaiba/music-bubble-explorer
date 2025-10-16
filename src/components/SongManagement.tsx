import React, { useState, useCallback, useEffect, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { Song } from '@/types/music'
import { DataManager } from '@/services/dataManager'
import { MusicDataService } from '@/services/musicDataService'
// ErrorHandler import removed - using simple error handling
import { SongRegistrationForm } from './SongRegistrationForm'

interface SongManagementProps {
    onClose: () => void
    isVisible: boolean
    onSongUpdated?: (song: Song) => void
    onSongDeleted?: (songId: string) => void
}

interface DeleteConfirmationState {
    isOpen: boolean
    song: Song | null
}

/**
 * 楽曲管理コンポーネント
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */
export const SongManagement: React.FC<SongManagementProps> = React.memo(({
    onClose,
    isVisible,
    onSongUpdated,
    onSongDeleted
}) => {
    // State management
    const [songs, setSongs] = useState<Song[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingSong, setEditingSong] = useState<Song | null>(null)
    const [showEditForm, setShowEditForm] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
        isOpen: false,
        song: null
    })
    const [isDeleting, setIsDeleting] = useState(false)

    /**
     * 楽曲データを読み込み
     */
    const loadSongs = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const loadedSongs = DataManager.loadSongs()

            setSongs(loadedSongs)
            console.log(`Loaded ${loadedSongs.length} songs for management`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '楽曲データの読み込みに失敗しました'
            setError(errorMessage)
            console.error('Failed to load songs:', err)
        } finally {
            setIsLoading(false)
        }
    }, [])

    /**
     * コンポーネントマウント時に楽曲データを読み込み
     */
    useEffect(() => {
        if (isVisible) {
            loadSongs()
        }
    }, [isVisible, loadSongs])

    /**
     * 検索フィルタリング
     */
    const filteredSongs = useMemo(() => {
        if (!searchQuery.trim()) {
            return songs
        }

        const query = searchQuery.toLowerCase()
        return songs.filter(song =>
            song.title.toLowerCase().includes(query) ||
            song.lyricists.some(lyricist => lyricist.toLowerCase().includes(query)) ||
            song.composers.some(composer => composer.toLowerCase().includes(query)) ||
            song.arrangers.some(arranger => arranger.toLowerCase().includes(query)) ||
            (song.tags && song.tags.some(tag => tag.toLowerCase().includes(query)))
        )
    }, [songs, searchQuery])

    /**
     * 楽曲編集を開始
     */
    const handleEditSong = useCallback((song: Song) => {
        setEditingSong(song)
        setShowEditForm(true)
    }, [])

    /**
     * 楽曲編集フォームを閉じる
     */
    const handleCloseEditForm = useCallback(() => {
        setEditingSong(null)
        setShowEditForm(false)
    }, [])

    /**
     * 楽曲更新処理
     */
    const handleSongUpdated = useCallback((updatedSong: Song) => {
        try {
            const updateSuccess = DataManager.updateSong(updatedSong)
            
            if (!updateSuccess) {
                throw new Error('楽曲の更新に失敗しました')
            }

            // ローカル状態を更新
            setSongs(prevSongs =>
                prevSongs.map(song =>
                    song.id === updatedSong.id ? updatedSong : song
                )
            )

            // MusicDataServiceのキャッシュをクリア
            const musicService = MusicDataService.getInstance()
            musicService.clearCache()

            // 親コンポーネントに通知
            onSongUpdated?.(updatedSong)

            // 編集フォームを閉じる
            handleCloseEditForm()

            console.log('Song updated successfully:', updatedSong.title)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '楽曲の更新に失敗しました'
            setError(errorMessage)
            console.error('Failed to update song:', err)
        }
    }, [onSongUpdated, handleCloseEditForm])

    /**
     * 削除確認ダイアログを開く
     */
    const handleDeleteSong = useCallback((song: Song) => {
        setDeleteConfirmation({
            isOpen: true,
            song
        })
    }, [])

    /**
     * 削除確認ダイアログを閉じる
     */
    const handleCloseDeleteConfirmation = useCallback(() => {
        setDeleteConfirmation({
            isOpen: false,
            song: null
        })
    }, [])

    /**
     * 楽曲削除を実行
     */
    const handleConfirmDelete = useCallback(async () => {
        if (!deleteConfirmation.song) return

        setIsDeleting(true)
        const songToDelete = deleteConfirmation.song

        try {
            const deleteSuccess = DataManager.deleteSong(songToDelete.id)
            
            if (!deleteSuccess) {
                throw new Error('楽曲の削除に失敗しました')
            }

            // ローカル状態を更新
            setSongs(prevSongs =>
                prevSongs.filter(song => song.id !== songToDelete.id)
            )

            // MusicDataServiceのキャッシュをクリア
            const musicService = MusicDataService.getInstance()
            musicService.clearCache()

            // 親コンポーネントに通知
            onSongDeleted?.(songToDelete.id)

            // 削除確認ダイアログを閉じる
            handleCloseDeleteConfirmation()

            console.log('Song deleted successfully:', songToDelete.title)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '楽曲の削除に失敗しました'
            setError(errorMessage)
            console.error('Failed to delete song:', err)
        } finally {
            setIsDeleting(false)
        }
    }, [deleteConfirmation.song, onSongDeleted, handleCloseDeleteConfirmation])



    /**
     * 背景クリックでモーダルを閉じる
     */
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }, [onClose])

    /**
     * キーボードナビゲーション
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return

            if (e.key === 'Escape') {
                if (showEditForm) {
                    handleCloseEditForm()
                } else if (deleteConfirmation.isOpen) {
                    handleCloseDeleteConfirmation()
                } else {
                    onClose()
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isVisible, showEditForm, deleteConfirmation.isOpen, onClose, handleCloseEditForm, handleCloseDeleteConfirmation])

    if (!isVisible) return null

    return (
        <ManagementOverlay
            $isVisible={isVisible}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="management-title"
        >
            <ManagementContainer $isVisible={isVisible}>
                <ManagementHeader>
                    <ManagementTitle id="management-title">🎵 楽曲管理</ManagementTitle>
                    <CloseButton
                        type="button"
                        onClick={onClose}
                        aria-label="楽曲管理を閉じる"
                        title="楽曲管理を閉じる (ESCキー)"
                    >
                        ×
                    </CloseButton>
                </ManagementHeader>

                <ManagementBody>
                    {error && (
                        <ErrorMessage role="alert">
                            <ErrorIcon>⚠️</ErrorIcon>
                            {error}
                            <ErrorCloseButton
                                onClick={() => setError(null)}
                                aria-label="エラーメッセージを閉じる"
                            >
                                ×
                            </ErrorCloseButton>
                        </ErrorMessage>
                    )}

                    {isLoading ? (
                        <LoadingContainer>
                            <LoadingSpinner />
                            <LoadingText>楽曲データを読み込んでいます...</LoadingText>
                        </LoadingContainer>
                    ) : (
                        <>
                            {/* 検索フィールド */}
                            <SearchContainer>
                                <SearchInput
                                    type="text"
                                    placeholder="楽曲名、作詞家、作曲家、編曲家、タグで検索..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="楽曲検索"
                                />
                                <SearchIcon>🔍</SearchIcon>
                            </SearchContainer>

                            {/* 楽曲統計 */}
                            <StatsContainer>
                                <StatItem>
                                    <StatLabel>総楽曲数:</StatLabel>
                                    <StatValue>{songs.length}曲</StatValue>
                                </StatItem>
                                <StatItem>
                                    <StatLabel>検索結果:</StatLabel>
                                    <StatValue>{filteredSongs.length}曲</StatValue>
                                </StatItem>
                            </StatsContainer>



                            {/* 楽曲一覧 */}
                            <SongList>
                                {filteredSongs.length === 0 ? (
                                    <EmptyState>
                                        <EmptyIcon>🎵</EmptyIcon>
                                        <EmptyText>
                                            {searchQuery ? '検索条件に一致する楽曲が見つかりません' : '登録された楽曲がありません'}
                                        </EmptyText>
                                    </EmptyState>
                                ) : (
                                    filteredSongs.map((song) => (
                                        <SongItem key={song.id}>
                                            <SongInfo>
                                                <SongTitle>{song.title}</SongTitle>
                                                <SongDetails>
                                                    {song.lyricists.length > 0 && (
                                                        <DetailItem>
                                                            <DetailLabel>作詞:</DetailLabel>
                                                            <DetailValue>{song.lyricists.join(', ')}</DetailValue>
                                                        </DetailItem>
                                                    )}
                                                    {song.composers.length > 0 && (
                                                        <DetailItem>
                                                            <DetailLabel>作曲:</DetailLabel>
                                                            <DetailValue>{song.composers.join(', ')}</DetailValue>
                                                        </DetailItem>
                                                    )}
                                                    {song.arrangers.length > 0 && (
                                                        <DetailItem>
                                                            <DetailLabel>編曲:</DetailLabel>
                                                            <DetailValue>{song.arrangers.join(', ')}</DetailValue>
                                                        </DetailItem>
                                                    )}
                                                    {song.tags && song.tags.length > 0 && (
                                                        <DetailItem>
                                                            <DetailLabel>タグ:</DetailLabel>
                                                            <DetailValue>{song.tags.join(', ')}</DetailValue>
                                                        </DetailItem>
                                                    )}
                                                </SongDetails>
                                            </SongInfo>
                                            <SongActions>
                                                <EditButton
                                                    onClick={() => handleEditSong(song)}
                                                    aria-label={`${song.title}を編集`}
                                                    title="楽曲を編集"
                                                >
                                                    ✏️
                                                </EditButton>
                                                <DeleteButton
                                                    onClick={() => handleDeleteSong(song)}
                                                    aria-label={`${song.title}を削除`}
                                                    title="楽曲を削除"
                                                >
                                                    🗑️
                                                </DeleteButton>
                                            </SongActions>
                                        </SongItem>
                                    ))
                                )}
                            </SongList>
                        </>
                    )}
                </ManagementBody>
            </ManagementContainer>

            {/* 編集フォーム */}
            {showEditForm && editingSong && (
                <SongRegistrationForm
                    isVisible={showEditForm}
                    onClose={handleCloseEditForm}
                    onSongAdded={handleSongUpdated}
                    editingSong={editingSong}
                />
            )}

            {/* 削除確認ダイアログ */}
            {deleteConfirmation.isOpen && deleteConfirmation.song && (
                <DeleteConfirmationOverlay>
                    <DeleteConfirmationDialog>
                        <DeleteConfirmationHeader>
                            <DeleteConfirmationTitle>楽曲の削除確認</DeleteConfirmationTitle>
                        </DeleteConfirmationHeader>
                        <DeleteConfirmationBody>
                            <DeleteConfirmationText>
                                以下の楽曲を削除してもよろしいですか？
                            </DeleteConfirmationText>
                            <DeleteSongInfo>
                                <DeleteSongTitle>「{deleteConfirmation.song.title}」</DeleteSongTitle>
                                <DeleteSongDetails>
                                    この操作は取り消すことができません。
                                </DeleteSongDetails>
                            </DeleteSongInfo>
                        </DeleteConfirmationBody>
                        <DeleteConfirmationActions>
                            <CancelDeleteButton
                                onClick={handleCloseDeleteConfirmation}
                                disabled={isDeleting}
                            >
                                キャンセル
                            </CancelDeleteButton>
                            <ConfirmDeleteButton
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <LoadingSpinner />
                                        削除中...
                                    </>
                                ) : (
                                    '削除する'
                                )}
                            </ConfirmDeleteButton>
                        </DeleteConfirmationActions>
                    </DeleteConfirmationDialog>
                </DeleteConfirmationOverlay>
            )}


        </ManagementOverlay>
    )
})

// アニメーション定義
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const slideIn = keyframes`
  from {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

// スタイル定義
const ManagementOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
  
  animation: ${fadeIn} 0.3s ease-out;
`

const ManagementContainer = styled.div<{ $isVisible: boolean }>`
  background: linear-gradient(135deg, #fff0f8 0%, #ffe8f0 100%);
  border-radius: 25px;
  box-shadow: 0 25px 50px rgba(255, 105, 180, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  border: 3px solid #ffb6c1;
  
  animation: ${slideIn} 0.3s ease-out;

  @media (max-width: 768px) {
    margin: 16px;
    max-height: 95vh;
    border-radius: 12px;
  }
`

const ManagementHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 2px solid #ffb6c1;
  background: linear-gradient(90deg, rgba(255, 182, 193, 0.1) 0%, rgba(255, 105, 180, 0.1) 100%);
`

const ManagementTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #5a5a5a;
  margin: 0;
`

const CloseButton = styled.button`
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: 2px solid #fff;
  font-size: 18px;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-weight: bold;

  &:hover {
    background: linear-gradient(135deg, #ff1493, #dc143c);
    transform: scale(1.1);
  }
`

const ManagementBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 100px);
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 20px;
    max-height: calc(95vh - 90px);
  }
`

const ErrorMessage = styled.div`
  background: rgba(255, 105, 180, 0.1);
  border: 1px solid #ff69b4;
  border-radius: 8px;
  padding: 12px 16px;
  color: #ff69b4;
  font-size: 14px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`

const ErrorIcon = styled.span`
  font-size: 16px;
`

const ErrorCloseButton = styled.button`
  background: none;
  border: none;
  color: #ff69b4;
  cursor: pointer;
  font-size: 16px;
  margin-left: auto;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 105, 180, 0.1);
    border-radius: 50%;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
`

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 105, 180, 0.3);
  border-top: 3px solid #ff69b4;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const LoadingText = styled.div`
  color: #5a5a5a;
  font-size: 14px;
`

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid #ffb6c1;
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  color: #5a5a5a;

  &:focus {
    outline: none;
    border-color: #ff69b4;
    box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
  }

  &::placeholder {
    color: #8a8a8a;
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #8a8a8a;
`

const StatsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  border: 1px solid #ffb6c1;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const StatLabel = styled.span`
  font-size: 14px;
  color: #5a5a5a;
  font-weight: 500;
`

const StatValue = styled.span`
  font-size: 14px;
  color: #ff69b4;
  font-weight: 600;
`

const SongList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

const EmptyIcon = styled.div`
  font-size: 48px;
  opacity: 0.5;
`

const EmptyText = styled.div`
  color: #8a8a8a;
  font-size: 16px;
`

const SongItem = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ffb6c1;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: #ff69b4;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 105, 180, 0.2);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`

const SongInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const SongTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #5a5a5a;
  margin: 0 0 8px 0;
  word-break: break-word;
`

const SongDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DetailItem = styled.div`
  display: flex;
  gap: 8px;
  font-size: 14px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 2px;
  }
`

const DetailLabel = styled.span`
  color: #8a8a8a;
  font-weight: 500;
  min-width: 40px;
`

const DetailValue = styled.span`
  color: #5a5a5a;
  word-break: break-word;
`

const SongActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    align-self: flex-end;
  }
`

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ffb6c1;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  font-size: 16px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
`

const EditButton = styled(ActionButton)`
  &:hover {
    border-color: #4caf50;
    color: #4caf50;
  }
`

const DeleteButton = styled(ActionButton)`
  &:hover {
    border-color: #f44336;
    color: #f44336;
  }
`

// 削除確認ダイアログのスタイル
const DeleteConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 20px;
`

const DeleteConfirmationDialog = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 100%;
  overflow: hidden;
`

const DeleteConfirmationHeader = styled.div`
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e0e0e0;
`

const DeleteConfirmationTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #5a5a5a;
  margin: 0;
`

const DeleteConfirmationBody = styled.div`
  padding: 20px 24px;
`

const DeleteConfirmationText = styled.p`
  color: #5a5a5a;
  font-size: 14px;
  margin: 0 0 16px 0;
  line-height: 1.5;
`

const DeleteSongInfo = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 12px;
`

const DeleteSongTitle = styled.div`
  font-weight: 600;
  color: #f44336;
  margin-bottom: 4px;
`

const DeleteSongDetails = styled.div`
  font-size: 12px;
  color: #8a8a8a;
`

const DeleteConfirmationActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 20px;
  justify-content: flex-end;
`

const DeleteActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`

const CancelDeleteButton = styled(DeleteActionButton)`
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e0e0e0;
  color: #5a5a5a;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    border-color: #8a8a8a;
  }
`

const ConfirmDeleteButton = styled(DeleteActionButton)`
  background: #f44336;
  border: 1px solid #f44336;
  color: white;

  &:hover:not(:disabled) {
    background: #d32f2f;
    border-color: #d32f2f;
  }
`



export default SongManagement