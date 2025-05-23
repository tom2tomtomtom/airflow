import React from 'react';
import { Grid, Paper, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TemplateCard from './TemplateCard';
import { Template } from '@/types/models';

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onDuplicate: (template: Template) => void;
  onCreateMatrix: (templateId: string) => void;
  onAddTemplate: () => void;
  emptyMessage: string;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateMatrix,
  onAddTemplate,
  emptyMessage,
}) => (
  <Grid container spacing={3}>
    {templates.length > 0 ? (
      templates.map((template) => (
        <Grid item key={template.id} xs={12} sm={6} md={4}>
          <TemplateCard
            template={template}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onCreateMatrix={onCreateMatrix}
          />
        </Grid>
      ))
    ) : (
      <Grid item xs={12}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddTemplate}
            sx={{ mt: 2 }}
          >
            Create Template
          </Button>
        </Paper>
      </Grid>
    )}
  </Grid>
);

export default TemplateList;
