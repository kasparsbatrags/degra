import React from 'react'
import {ActivityIndicator, Platform, Pressable, StyleSheet, Text, View} from 'react-native'
import {COLORS, FONT} from '../constants/theme'

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, loading, onPageChange }: PaginationProps) => {
  // Web pagination with page numbers
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.paginationWeb}>
          {/* Previous button */}
          <Pressable
            style={[styles.pageButton, currentPage === 0 && styles.pageButtonDisabled]}
            onPress={() => currentPage > 0 && onPageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            <Text style={styles.pageButtonText}>←</Text>
          </Pressable>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Logic to show current page and surrounding pages
            let pageToShow;
            if (totalPages <= 5) {
              pageToShow = i;
            } else if (currentPage < 3) {
              pageToShow = i;
            } else if (currentPage > totalPages - 3) {
              pageToShow = totalPages - 5 + i;
            } else {
              pageToShow = currentPage - 2 + i;
            }
            
            return (
              <Pressable
                key={pageToShow}
                style={[styles.pageButton, currentPage === pageToShow && styles.pageButtonActive]}
                onPress={() => onPageChange(pageToShow)}
                disabled={loading}
              >
                <Text 
                  style={[
                    styles.pageButtonText, 
                    currentPage === pageToShow && styles.pageButtonTextActive
                  ]}
                >
                  {pageToShow + 1}
                </Text>
              </Pressable>
            );
          })}
          
          {/* Next button */}
          <Pressable
            style={[styles.pageButton, currentPage === totalPages - 1 && styles.pageButtonDisabled]}
            onPress={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1 || loading}
          >
            <Text style={styles.pageButtonText}>→</Text>
          </Pressable>
        </View>
        
        {loading && <ActivityIndicator size="small" color={COLORS.secondary} style={styles.loader} />}
      </View>
    );
  }
  
  // Mobile "Load More" button
  return (
    <View style={styles.container}>
      {currentPage < totalPages - 1 && (
        <Pressable
          style={styles.loadMoreButton}
          onPress={() => onPageChange(currentPage + 1)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.loadMoreText}>Ielādēt vairāk</Text>
          )}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  paginationWeb: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: COLORS.black100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pageButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    color: COLORS.white,
    fontFamily: FONT.medium,
  },
  pageButtonTextActive: {
    fontFamily: FONT.bold,
  },
  loadMoreButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  loadMoreText: {
    color: COLORS.white,
    fontFamily: FONT.semiBold,
    fontSize: 16,
  },
  loader: {
    marginTop: 8,
  },
});

export default Pagination;
