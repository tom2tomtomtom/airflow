                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {asset.metadata.fileSize} • {asset.metadata.dimensions || asset.metadata.duration}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    sx={{ ml: 'auto' }}
                                    onClick={() => handleOpenAssetDialog(field.id)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              ) : (
                                <Button
                                  variant="outlined"
                                  startIcon={getFieldTypeIcon(field.type)}
                                  onClick={() => handleOpenAssetDialog(field.id)}
                                >
                                  Select {field.type}
                                </Button>
                              )
                            ) : (
                              <TextField
                                fullWidth
                                size="small"
                                placeholder={`Enter ${field.type}...`}
                                value={fieldAssignment?.value || ''}
                                onChange={(e) => handleTextFieldChange(field.id, e.target.value)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={fieldAssignment?.status === 'completed' ? 'Completed' :
                                    fieldAssignment?.status === 'in-progress' ? 'In Progress' : 'Empty'}
                              color={fieldAssignment?.status === 'completed' ? 'success' :
                                    fieldAssignment?.status === 'in-progress' ? 'primary' : 'default'}
                              size="small"
                              icon={fieldAssignment?.status === 'completed' ? <CheckIcon /> :
                                    fieldAssignment?.status === 'in-progress' ? <RefreshIcon /> : <CloseIcon />}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}

        {/* Asset Selection Dialog */}
        <Dialog
          open={openAssetDialog}
          onClose={() => setOpenAssetDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Select Asset
            {currentField && selectedTemplate && (
              <Typography variant="body2" color="text.secondary">
                {selectedTemplate.name} - {selectedTemplate.dynamicFields.find(f => f.id === currentField.fieldId)?.name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, mt: 1 }}>
              <TextField
                placeholder="Search assets..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Filter chips */}
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center' }}>
                Filter by:
              </Typography>
              {['image', 'video', 'audio'].map((type) => {
                // Only show relevant filter based on field type
                if (currentField && selectedTemplate) {
                  const field = selectedTemplate.dynamicFields.find(f => f.id === currentField.fieldId);
                  if (field && field.type !== type && field.type !== 'any') return null;
                }

                const icon = type === 'image' ? <ImageIcon fontSize="small" /> :
                            type === 'video' ? <VideoIcon fontSize="small" /> :
                            <AudiotrackIcon fontSize="small" />;

                return (
                  <Chip
                    key={type}
                    icon={icon}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      // Filter logic would go here in a real app
                    }}
                  />
                );
              })}

              <Chip
                label="Favorites"
                variant="outlined"
                color="secondary"
                onClick={() => {
                  // Filter by favorites logic
                }}
              />

              <Chip
                label="Recent"
                variant="outlined"
                onClick={() => {
                  // Filter by recent logic
                }}
              />
            </Box>

            {filteredAssets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No assets found matching your search criteria.
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => setSearchQuery('')}
                  sx={{ mt: 2 }}
                >
                  Clear Search
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filteredAssets
                  .filter(asset => {
                    if (!currentField) return true;
                    const field = selectedTemplate?.dynamicFields.find(f => f.id === currentField.fieldId);
                    if (!field) return true;

                    // Filter assets by type
                    if (field.type === 'image') return asset.type === 'image';
                    if (field.type === 'video') return asset.type === 'video';
                    if (field.type === 'audio') return asset.type === 'audio';
                    return true;
                  })
                  .map(asset => (
                    <Grid item xs={12} sm={6} md={4} key={asset.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 1px rgba(25, 118, 210, 0.5)'
                          }
                        }}
                        onClick={() => handleSelectAsset(asset.id)}
                      >
                        {asset.type === 'image' && (
                          <Box
                            component="img"
                            src={asset.url}
                            alt={asset.name}
                            sx={{
                              width: '100%',
                              height: 140,
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        {asset.type === 'video' && (
                          <Box
                            sx={{
                              width: '100%',
                              height: 140,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}
                          >
                            <VideoIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                          </Box>
                        )}
                        {asset.type === 'audio' && (
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}
                          >
                            <AudiotrackIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                          </Box>
                        )}
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Typography variant="subtitle2" noWrap sx={{ maxWidth: '80%' }}>
                              {asset.name}
                            </Typography>
                            {asset.isFavorite && (
                              <ThumbUpIcon fontSize="small" color="primary" />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)} • {asset.metadata.fileSize}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            {asset.metadata.dimensions || asset.metadata.duration || ''}
                          </Typography>
                          {asset.tags && asset.tags.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              {asset.tags.slice(0, 2).map(tag => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                              {asset.tags && asset.tags.length > 2 && (
                                <Chip
                                  label={`+${asset.tags.length - 2}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              )}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAssetDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                // In a real app, this would open the asset upload dialog
                alert('Upload asset functionality would go here');
              }}
            >
              Upload New Asset
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default MatrixPage;