import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowDropDown as ArrowDropDownIcon,
  Business as BusinessIcon,
  Check as CheckIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useClient } from '@/contexts/ClientContext';
import { useClients } from '@/hooks/useData';

interface ClientSelectorProps {
  variant?: 'button' | 'chip' | 'compact';
  showAddOption?: boolean;
  onClientChange?: (client: any) => void;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  variant = 'button',
  showAddOption = true,
  onClientChange,
}) => {
  const router = useRouter();
  const { activeClient, setActiveClient } = useClient();
  const { data: clients, isLoading } = useClients();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchTerm('');
  };

  const handleSelectClient = (client: any) => {
    setActiveClient(client);
    if (onClientChange) {
      onClientChange(client);
    }
    handleClose();
  };

  const handleAddClient = () => {
    handleClose();
    router.push('/create-client');
  };

  const filteredClients = clients?.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderButton = () => {
    switch (variant) {
      case 'chip':
        return activeClient ? (
          <Chip
            avatar={
              activeClient.logo ? (
                <Avatar src={activeClient.logo} />
              ) : (
                <Avatar sx={{ bgcolor: activeClient.primaryColor }}>
                  <BusinessIcon sx={{ fontSize: 16 }} />
                </Avatar>
              )
            }
            label={activeClient.name}
            onClick={handleClick}
            onDelete={handleClick}
            deleteIcon={<ArrowDropDownIcon />}
          />
        ) : (
          <Chip
            icon={<BusinessIcon />}
            label="Select Client"
            onClick={handleClick}
            onDelete={handleClick}
            deleteIcon={<ArrowDropDownIcon />}
            variant="outlined"
          />
        );

      case 'compact':
        return (
          <Box
            onClick={handleClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              p: 1,
              borderRadius: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {activeClient ? (
              <>
                {activeClient.logo ? (
                  <Avatar src={activeClient.logo} sx={{ width: 24, height: 24 }} />
                ) : (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: activeClient.primaryColor }}>
                    <BusinessIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                )}
                <Typography variant="body2">{activeClient.name}</Typography>
              </>
            ) : (
              <>
                <BusinessIcon sx={{ fontSize: 20 }} />
                <Typography variant="body2">Select Client</Typography>
              </>
            )}
            <ArrowDropDownIcon />
          </Box>
        );

      default:
        return (
          <Button
            variant="outlined"
            onClick={handleClick}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} />
              ) : activeClient ? (
                activeClient.logo ? (
                  <Avatar src={activeClient.logo} sx={{ width: 24, height: 24 }} />
                ) : (
                  <Avatar sx={{ width: 24, height: 24, bgcolor: activeClient.primaryColor }}>
                    <BusinessIcon sx={{ fontSize: 14 }} />
                  </Avatar>
                )
              ) : (
                <BusinessIcon />
              )
            }
            endIcon={<ArrowDropDownIcon />}
          >
            {isLoading ? 'Loading...' : activeClient ? activeClient.name : 'Select Client'}
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 280,
          },
        }}
      >
        {clients && clients.length > 3 && (
          <Box px={2} py={1}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
          </Box>
        )}
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <MenuItem
              key={client.id}
              onClick={() => handleSelectClient(client)}
              selected={activeClient?.id === client.id}
            >
              <ListItemIcon>
                {client.logo ? (
                  <Avatar src={client.logo} sx={{ width: 32, height: 32 }} />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: client.primaryColor }}>
                    <BusinessIcon />
                  </Avatar>
                )}
              </ListItemIcon>
              <ListItemText
                primary={client.name}
                secondary={client.industry}
              />
              {activeClient?.id === client.id && (
                <CheckIcon fontSize="small" color="primary" />
              )}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'No clients found' : 'No clients available'}
            </Typography>
          </MenuItem>
        )}
        {showAddOption && (
          <>
            <Divider />
            <MenuItem onClick={handleAddClient}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Add New Client" />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default ClientSelector;
